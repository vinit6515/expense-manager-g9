from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timezone
import os
from dateutil import parser as dateparser
import csv
from io import StringIO

MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("MONGODB_DB", "expense_manager")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
expenses = db["transactions"]
incomes = db["incomes"]

app = Flask(__name__)
CORS(app)

def to_ym(dt: datetime):
    return f"{dt.year:04d}-{dt.month:02d}"

def start_of_month(dt: datetime):
    return datetime(dt.year, dt.month, 1, tzinfo=timezone.utc)

def start_of_year(dt: datetime):
    return datetime(dt.year, 1, 1, tzinfo=timezone.utc)

def parse_iso(s):
    try:
        return dateparser.isoparse(s)
    except Exception:
        return None

@app.get("/health")
def health():
    return jsonify({"ok": True})

@app.post("/income")
def set_income():
    data = request.get_json(force=True) or {}
    amount = float(data.get("amount", 0))
    source = (data.get("source") or "").strip()
    now = datetime.now(timezone.utc)
    ym = to_ym(now)
    incomes.update_one(
        {"month": ym},
        {"$set": {"amount": amount, "source": source, "updatedAt": now}},
        upsert=True,
    )
    return jsonify({"ok": True})

@app.post("/expenses")
def add_expense():
    data = request.get_json(force=True) or {}
    doc = {
        "amount": float(data.get("amount", 0)),
        "category": data.get("category") or "Other",
        "payment_mode": data.get("payment_mode") or "Cash",
        "tags": data.get("tags") or [],
        "remarks": data.get("remarks") or "",
        "type": data.get("type") or "expense",
        "date": datetime.now(timezone.utc),
    }
    res = expenses.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return jsonify(doc), 201

@app.get("/expenses")
def list_expenses():
    limit = int(request.args.get("limit", 20))
    items = []
    for x in expenses.find().sort("date", -1).limit(limit):
        x["_id"] = str(x["_id"])
        x["date"] = x.get("date").isoformat() if x.get("date") else None
        items.append(x)
    return jsonify({"items": items})

@app.get("/expenses/export")
def export_expenses():
    month = request.args.get("month", "")
    if not month or len(month) != 7 or month[4] != "-":
        return jsonify({"error": "Invalid month format. Use YYYY-MM"}), 400

    try:
        year, month_num = int(month[:4]), int(month[5:7])
        start_date = datetime(year, month_num, 1, tzinfo=timezone.utc)
        if month_num == 12:
            end_date = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end_date = datetime(year, month_num + 1, 1, tzinfo=timezone.utc)
    except ValueError:
        return jsonify({"error": "Invalid month format"}), 400

    # Fetch expenses for the month
    items = list(expenses.find({
        "date": {"$gte": start_date, "$lt": end_date},
        "type": {"$ne": "investment"}
    }).sort("date", -1))

    # Generate CSV
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Category", "Payment Mode", "Amount", "Tags", "Remarks"])

    for item in items:
        date_str = item.get("date").strftime("%Y-%m-%d") if item.get("date") else ""
        category = item.get("category", "")
        payment_mode = item.get("payment_mode", "")
        amount = item.get("amount", 0)
        tags = ", ".join(item.get("tags", []))
        remarks = item.get("remarks", "")
        writer.writerow([date_str, category, payment_mode, amount, tags, remarks])

    csv_data = output.getvalue()
    return csv_data, 200, {
        "Content-Type": "text/csv",
        "Content-Disposition": f"attachment; filename=expenses-{month}.csv"
    }

@app.get("/stats")
def stats():
    now = datetime.now(timezone.utc)
    som = start_of_month(now)
    soy = start_of_year(now)
    ym = to_ym(now)

    inc_mtd = incomes.find_one({"month": ym}) or {"amount": 0}
    inc_ytd_cursor = incomes.find({"month": {"$regex": f"^{now.year}-"}})
    inc_ytd = sum(float(x.get("amount", 0)) for x in inc_ytd_cursor)

    pipeline_common = [
        {"$match": {"date": {"$exists": True}}},
        {"$project": {
            "amount": 1,
            "date": 1,
            "type": 1
        }},
    ]
    mtd_expenses = list(expenses.aggregate(pipeline_common + [
        {"$match": {"date": {"$gte": som}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]))
    ytd_expenses = list(expenses.aggregate(pipeline_common + [
        {"$match": {"date": {"$gte": soy}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]))

    mtd_invest = list(expenses.aggregate([
        {"$match": {"date": {"$gte": som}, "type": "investment"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]))
    ytd_invest = list(expenses.aggregate([
        {"$match": {"date": {"$gte": soy}, "type": "investment"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]))

    return jsonify({
        "mtdIncome": float(inc_mtd.get("amount", 0)),
        "ytdIncome": float(inc_ytd),
        "mtdInvestments": float(mtd_invest[0]["total"]) if mtd_invest else 0.0,
        "ytdInvestments": float(ytd_invest[0]["total"]) if ytd_invest else 0.0,
        "mtdExpenses": float(mtd_expenses[0]["total"]) if mtd_expenses else 0.0,
        "ytdExpenses": float(ytd_expenses[0]["total"]) if ytd_expenses else 0.0,
    })

@app.get("/analytics")
def analytics():
    start = parse_iso(request.args.get("start", ""))
    end = parse_iso(request.args.get("end", ""))

    match_filter = {"type": {"$ne": "investment"}}
    if start:
        match_filter["date"] = match_filter.get("date", {})
        match_filter["date"]["$gte"] = start
    if end:
        match_filter["date"] = match_filter.get("date", {})
        match_filter["date"]["$lte"] = end

    by_category = list(expenses.aggregate([
        {"$match": match_filter},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}}
    ]))
    by_category = [{"name": x["_id"], "total": float(x["total"])} for x in by_category]

    by_pay = list(expenses.aggregate([
        {"$match": match_filter},
        {"$group": {"_id": "$payment_mode", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}}
    ]))
    by_pay = [{"name": x["_id"], "total": float(x["total"])} for x in by_pay]

    by_tag = list(expenses.aggregate([
        {"$match": {**match_filter, "tags": {"$exists": True, "$ne": []}}},
        {"$unwind": {"path": "$tags", "preserveNullAndEmptyArrays": False}},
        {"$group": {"_id": "$tags", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}}
    ]))
    by_tag = [{"name": x["_id"], "total": float(x["total"])} for x in by_tag]

    return jsonify({
        "byCategory": by_category,
        "byPaymentMode": by_pay,
        "byTag": by_tag
    })

@app.get("/analytics/timeseries")
def analytics_timeseries():
    start = parse_iso(request.args.get("start", ""))
    end = parse_iso(request.args.get("end", ""))

    match_filter = {"type": {"$ne": "investment"}}
    if start:
        match_filter["date"] = match_filter.get("date", {})
        match_filter["date"]["$gte"] = start
    if end:
        match_filter["date"] = match_filter.get("date", {})
        match_filter["date"]["$lte"] = end

    pipeline = [
        {"$match": match_filter},
        {"$project": {
            "amount": 1,
            "day": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}}
        }},
        {"$group": {"_id": "$day", "total": {"$sum": "$amount"}}},
        {"$sort": {"_id": 1}},
    ]
    rows = list(expenses.aggregate(pipeline))
    items = [{"date": r["_id"], "total": float(r["total"])} for r in rows]
    return jsonify(items)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")))
