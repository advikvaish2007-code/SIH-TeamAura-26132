import urllib.request
import json

base = 'http://127.0.0.1:8000'

# Test 1: Optimizer
body = json.dumps({
    'origin_location': 'Niphad, Nashik, MH',
    'origin_lat': 20.0110,
    'origin_lng': 74.0520,
    'crop_name': 'Onion',
    'quantity_qtl': 150.0,
    'vehicle_type': 'canter_5t',
    'diesel_price': 92.5
}).encode()

req = urllib.request.Request(base + '/api/optimize-profit', data=body, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode())
    rankings = res['rankings']
    best = rankings[0]
    gross_best = max(rankings, key=lambda x: x['gross_revenue'])
    advantage = best['net_profit'] - gross_best['net_profit']
    print(f"OPTIMIZER: Optimal={best['mandi_name']} (Net Rs {best['net_profit']:,}) | Deceptive Gross={gross_best['mandi_name']} (Gross Rs {gross_best['gross_revenue']:,}, Net Rs {gross_best['net_profit']:,}) | In-Pocket Advantage=+Rs {advantage:,} | CO2 Saved={best.get('carbon_saved_kg')} kg")



# Test 2: AI Grader
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
with open('frontend/assets/samples/wheat_sample.jpg', 'rb') as f:
    img_data = f.read()

part1 = f'--{boundary}\r\nContent-Disposition: form-data; name="crop_name"\r\n\r\nWheat\r\n'.encode()
part2 = f'--{boundary}\r\nContent-Disposition: form-data; name="lot_id"\r\n\r\nLOT-WH-2026\r\n'.encode()
part3 = f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="wheat_sample.jpg"\r\nContent-Type: image/jpeg\r\n\r\n'.encode()
payload = part1 + part2 + part3 + img_data + f'\r\n--{boundary}--\r\n'.encode()

req_ai = urllib.request.Request(base + '/api/ai/grade-image', data=payload, headers={'Content-Type': f'multipart/form-data; boundary={boundary}'})
with urllib.request.urlopen(req_ai) as resp:
    res_ai = json.loads(resp.read().decode())
    print(f"AI GRADER: Grade={res_ai['agmark_grade']} | Confidence={res_ai['confidence_score']}% | Moisture={res_ai['moisture_pct']}% | FairPrice=Rs {res_ai['fair_price_recommendation']:,} | Hash={res_ai['certificate_hash']}")


# Test 3: SMS simulation
sms_body = json.dumps({
    'farmer_name': 'Rameshwar Patil',
    'mobile': '+91 98220 14521',
    'crop': 'Onion',
    'quantity_qtl': 150,
    'net_profit': 416570,
    'mandi': 'Vashi APMC'
}).encode()
req_sms = urllib.request.Request(base + '/api/sms/send-simulation', data=sms_body, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req_sms) as resp:
    res_sms = json.loads(resp.read().decode())
    print(f"SMS SIMULATOR: Provider={res_sms['provider']} | Status={res_sms['status']} | Target={res_sms['mobile']}")

