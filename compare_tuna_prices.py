#!/usr/bin/env python3
"""
Compare TUNA prices from apr_data.json (current approach) with assets.json files.
"""

import json
from pathlib import Path
from datetime import datetime

# Paths
FRONTEND_DIR = Path(__file__).parent
APR_DATA_PATH = FRONTEND_DIR / "static" / "data" / "apr_data.json"
ANALYTICS_DIR = FRONTEND_DIR.parent / "solana_analytics"
CACHE_DIR = ANALYTICS_DIR / "cache" / "G9XfJoY81n8A9bZKaJFhJYomRrcvFkuJ22em2g8rZuCh"

TUNA_TOKEN_ADDRESS = "TUNAfXDZEdQizTMTh3uEvNvYqJmqFHZbEJt8joP4cyx"

def load_apr_data():
    """Load APR data with current TUNA prices."""
    with open(APR_DATA_PATH, 'r') as f:
        return json.load(f)

def get_assets_json_path(date_str):
    """Get path to assets.json file for a given date."""
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    year = str(dt.year)
    month = f"{dt.month:02d}"
    filename = f"{date_str}.assets.json"
    return CACHE_DIR / year / month / filename

def load_tuna_price_from_assets(date_str):
    """Load TUNA price from assets.json file."""
    assets_path = get_assets_json_path(date_str)

    if not assets_path.exists():
        return None

    with open(assets_path, 'r') as f:
        assets = json.load(f)

    if TUNA_TOKEN_ADDRESS in assets:
        return assets[TUNA_TOKEN_ADDRESS].get('price')

    return None

def compare_prices():
    """Compare TUNA prices from both sources."""
    apr_data = load_apr_data()

    print("=" * 100)
    print("TUNA Price Comparison: Current Approach (APR Data) vs Assets.json")
    print("=" * 100)
    print(f"{'Date':<12} {'APR Price':<15} {'Source':<10} {'Assets Price':<15} {'Delta':<10} {'Delta %':<10}")
    print("-" * 100)

    total_comparisons = 0
    matches_within_1pct = 0
    matches_within_5pct = 0
    max_delta = 0
    max_delta_date = None

    for day_data in apr_data['daily_apr']:
        date_str = day_data['date']
        apr_price = day_data['tuna_price_usd']
        price_source = day_data['tuna_price_source']

        assets_price = load_tuna_price_from_assets(date_str)

        if assets_price is not None:
            total_comparisons += 1
            delta = assets_price - apr_price
            delta_pct = (delta / apr_price) * 100 if apr_price > 0 else 0

            # Track statistics
            if abs(delta_pct) <= 1.0:
                matches_within_1pct += 1
            if abs(delta_pct) <= 5.0:
                matches_within_5pct += 1

            if abs(delta_pct) > abs(max_delta):
                max_delta = delta_pct
                max_delta_date = date_str

            # Format output
            delta_sign = "+" if delta >= 0 else ""
            status = "OK" if abs(delta_pct) <= 1.0 else ("~" if abs(delta_pct) <= 5.0 else "X")

            print(f"{date_str:<12} ${apr_price:<14.8f} {price_source:<10} ${assets_price:<14.8f} "
                  f"{delta_sign}{delta:<9.8f} {delta_sign}{delta_pct:<9.2f}% {status}")
        else:
            print(f"{date_str:<12} ${apr_price:<14.8f} {price_source:<10} {'N/A':<15} {'N/A':<10} {'N/A':<10}")

    # Summary statistics
    print("-" * 100)
    print("\nSummary Statistics:")
    print(f"Total comparisons: {total_comparisons}")
    print(f"Matches within 1%: {matches_within_1pct}/{total_comparisons} ({matches_within_1pct/total_comparisons*100:.1f}%)")
    print(f"Matches within 5%: {matches_within_5pct}/{total_comparisons} ({matches_within_5pct/total_comparisons*100:.1f}%)")
    print(f"Maximum delta: {max_delta:+.2f}% on {max_delta_date}")
    print("=" * 100)

if __name__ == "__main__":
    compare_prices()
