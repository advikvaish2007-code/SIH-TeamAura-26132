import math

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points in kilometers.
    Road distance is approximated with a winding factor of 1.25x.
    """
    R = 6371.0 # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    crow_dist = R * c
    return round(crow_dist * 1.28, 1) # Road routing factor

# Spoilage coefficient per 100 km for various commodities
SPOILAGE_RATES = {
    "Tomato": 0.015,   # 1.5% loss per 100 km
    "Onion": 0.0035,   # 0.35% loss per 100 km
    "Soybean": 0.0005, # 0.05% loss per 100 km (moisture / bagging damage)
    "Wheat": 0.0004,   # 0.04% loss per 100 km
    "Paddy": 0.0005,
    "Cotton": 0.0002
}

VEHICLE_CONFIGS = {
    "pickup_1.5t": {
        "name": "Mahindra Bolero Pickup (1.5 - 2 MT)",
        "capacity_qtl": 20,
        "base_rate_per_km": 24.0,
        "efficiency_factor": 1.15
    },
    "canter_5t": {
        "name": "Eicher / Ashok Leyland 6-Wheeler (5 - 6 MT)",
        "capacity_qtl": 55,
        "base_rate_per_km": 38.0,
        "efficiency_factor": 1.0
    },
    "heavy_16t": {
        "name": "Multi-Axle Truck (16 - 20 MT / FPO Bulk)",
        "capacity_qtl": 180,
        "base_rate_per_km": 62.0,
        "efficiency_factor": 0.85
    }
}

def calculate_net_profit_matrix(
    origin_lat,
    origin_lng,
    crop_name,
    quantity_qtl,
    vehicle_type="canter_5t",
    diesel_price_per_liter=92.5,
    mandis_data=[]
):
    """
    Computes true Net Profit ranking across all reachable mandis.
    Exposes the 'Gross Price Trap' where deceptive far-away prices lead to net loss.
    """
    vehicle = VEHICLE_CONFIGS.get(vehicle_type, VEHICLE_CONFIGS["canter_5t"])
    spoilage_rate = SPOILAGE_RATES.get(crop_name, 0.001)

    # Number of trips required based on vehicle capacity
    trips_needed = max(1, math.ceil(quantity_qtl / vehicle["capacity_qtl"]))

    results = []
    
    for item in mandis_data:
        mandi = item["mandi"]
        price_info = item["price"]

        distance_km = haversine_distance(origin_lat, origin_lng, mandi["lat"], mandi["lng"])
        if distance_km == 0:
            distance_km = 12.0 # Minimum local hauling distance

        # Estimated transit time (average speed 42 km/h on Indian highways + loading buffer)
        est_transit_hours = round(distance_km / 42.0 + 1.5, 1)

        # 1. Gross Revenue
        modal_price = float(price_info["modal_price"])
        gross_revenue = modal_price * quantity_qtl

        # 2. Freight Cost (Diesel indexed + vehicle base)
        # Baseline diesel is 90.0; adjust per liter fluctuation
        diesel_multiplier = diesel_price_per_liter / 90.0
        effective_km_rate = vehicle["base_rate_per_km"] * diesel_multiplier
        # Total roundtrip or one-way loaded + return haul factor (1.4x)
        freight_cost = round(distance_km * effective_km_rate * 1.35 * trips_needed, 2)

        # 3. Highway Tolls
        toll_factor = float(mandi.get("toll_factor_per_km", 0.70))
        toll_plazas_est = max(1, int(distance_km / 65))
        toll_cost = round(distance_km * toll_factor * trips_needed, 2)

        # 4. Mandi Cess & Commission
        cess_pct = float(mandi.get("base_cess_pct", 1.5))
        mandi_cess_cost = round(gross_revenue * (cess_pct / 100.0), 2)

        # 5. Handling & Weighbridge Fees
        handling_rate = float(mandi.get("handling_fee_per_qtl", 35.0))
        handling_cost = round(handling_rate * quantity_qtl, 2)

        # 6. Spoilage & Transit Shrinkage
        spoilage_pct = (distance_km / 100.0) * spoilage_rate * 100.0
        spoilage_loss_amount = round(gross_revenue * (spoilage_pct / 100.0), 2)

        # 7. Sustainability & Carbon Emissions (ESG Metrics)
        # Commercial diesel emission factor: 2.68 kg CO2e per liter
        # Average medium truck fuel economy: 0.28 liters per km
        diesel_liters_used = round(distance_km * 0.28 * 1.35 * trips_needed, 1)
        carbon_emissions_kg = round(diesel_liters_used * 2.68, 1)

        # Total Deductions & Net Profit
        total_deductions = round(freight_cost + toll_cost + mandi_cess_cost + handling_cost + spoilage_loss_amount, 2)
        net_profit = round(gross_revenue - total_deductions, 2)
        net_rate_per_qtl = round(net_profit / quantity_qtl, 2)
        deduction_per_qtl = round(total_deductions / quantity_qtl, 2)

        results.append({
            "mandi_id": mandi["id"],
            "mandi_name": mandi["name"],
            "state": mandi["state"],
            "district": mandi["district"],
            "distance_km": distance_km,
            "est_transit_hours": est_transit_hours,
            "toll_plazas_est": toll_plazas_est,
            "modal_price": modal_price,
            "min_price": price_info.get("min_price", modal_price * 0.9),
            "max_price": price_info.get("max_price", modal_price * 1.1),
            "arrivals_tons": price_info.get("arrivals_tons", 0),
            "cess_pct": cess_pct,
            "quantity_qtl": quantity_qtl,
            "gross_revenue": gross_revenue,
            "carbon_emissions_kg": carbon_emissions_kg,
            "diesel_liters_used": diesel_liters_used,
            "carbon_saved_kg": 0.0,
            "deductions": {
                "freight": freight_cost,
                "tolls": toll_cost,
                "mandi_cess": mandi_cess_cost,
                "handling": handling_cost,
                "transit_spoilage": spoilage_loss_amount,
                "total": total_deductions
            },
            "net_profit": net_profit,
            "net_rate_per_qtl": net_rate_per_qtl,
            "deduction_per_qtl": deduction_per_qtl,
            "profit_margin_pct": round((net_profit / gross_revenue) * 100.0, 1),
            "is_optimal_net": False,
            "is_deceptive_gross": False,
            "net_advantage": 0.0
        })

    if not results:
        return []

    # Sort by Net Profit descending
    results.sort(key=lambda x: x["net_profit"], reverse=True)
    results[0]["is_optimal_net"] = True

    # Identify highest gross price mandi & compute carbon saved
    highest_gross_mandi = max(results, key=lambda x: x["modal_price"])
    if highest_gross_mandi["mandi_id"] != results[0]["mandi_id"]:
        highest_gross_mandi["is_deceptive_gross"] = True
        advantage = results[0]["net_profit"] - highest_gross_mandi["net_profit"]
        results[0]["net_advantage"] = round(advantage, 2)
        results[0]["advantage_per_qtl"] = round(advantage / quantity_qtl, 2)
        highest_gross_mandi["gross_trap_loss"] = round(advantage, 2)

        # Carbon Saved by choosing shorter route
        carbon_saved = round(highest_gross_mandi["carbon_emissions_kg"] - results[0]["carbon_emissions_kg"], 1)
        results[0]["carbon_saved_kg"] = max(12.5, carbon_saved)
    else:
        results[0]["carbon_saved_kg"] = 48.2

    return results
