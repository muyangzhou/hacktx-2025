import requests
import datetime
import random
import time
import os
from dotenv import load_dotenv
from pathlib import Path


# Load environment variables from .env file
dotenv_path = Path("..\.env")
load_dotenv(dotenv_path=dotenv_path)

# --- 1. Configuration ---
# ⚠️ PASTE YOUR API KEY HERE!

API_KEY = os.getenv("NESSIE_API_KEY") 
BASE_URL = 'http://api.nessieisreal.com'

# --- Optional Existing IDs ---
# New Customer
# EXISTING_CUSTOMER_ID = "68f45d099683f20dd51a13d6"
# EXISTING_CHECKING_ID = "68f45d099683f20dd51a13d7"
# EXISTING_SAVINGS_ID =  "68f45d099683f20dd51a13d8"

# Empty Customer

# Generic Customer
EXISTING_CUSTOMER_ID = "68f426849683f20dd519ff48" 
EXISTING_CHECKING_ID = "68f426849683f20dd519ff49"
EXISTING_SAVINGS_ID = "68f426849683f20dd519ff4a"

# Good Customer
# EXISTING_CUSTOMER_ID = "68f441ee9683f20dd51a0c59"
# EXISTING_CHECKING_ID = "68f441ee9683f20dd51a0c5a"
# EXISTING_SAVINGS_ID =  "68f441ee9683f20dd51a0c5b"

# Bad Customer
# EXISTING_CUSTOMER_ID = "68f4425a9683f20dd51a0d6c"
# EXISTING_CHECKING_ID = "68f4425a9683f20dd51a0d6d"
# EXISTING_SAVINGS_ID =  "68f4425a9683f20dd51a0d6e"

# --- Stage Control Booleans ---
Generate = False
Generate_Deposit = False
Generate_Transfer = False
Generate_Good = True
Generate_Bad = False
Get = False
Delete = False


# --- 2. API Helper Functions ---

def post_request(endpoint, payload):
    """Helper function to make a POST request to the Nessie API."""
    # --- MODIFIED: Checks for existing '?' to append key correctly ---
    separator = '&' if '?' in endpoint else '?'
    url = f"{BASE_URL}{endpoint}{separator}key={API_KEY}"
    
    try:
        response = requests.post(
            url, 
            json=payload, 
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status() 
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"  ERROR: POST to {endpoint} failed: {e}")
        return None

def get_request(endpoint):
    """Helper function to make a GET request to the Nessie API."""
    # --- MODIFIED: Checks for existing '?' to append key correctly ---
    separator = '&' if '?' in endpoint else '?'
    url = f"{BASE_URL}{endpoint}{separator}key={API_KEY}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        print(f"  SUCCESS: GET from {endpoint} was successful.")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"  ERROR: GET from {endpoint} failed: {e}")
        return None

def delete_request(endpoint):
    """Helper function to make a DELETE request to the Nessie API."""
    # --- MODIFIED: Checks for existing '?' to append key correctly ---
    separator = '&' if '?' in endpoint else '?'
    url = f"{BASE_URL}{endpoint}{separator}key={API_KEY}"
    
    try:
        response = requests.delete(url)
        response.raise_for_status()
        print(f"  SUCCESS: DELETE to {endpoint} was successful.")
        return True
    except requests.exceptions.RequestException as e:
        print(f"  ERROR: DELETE to {endpoint} failed: {e}")
        return False

# --- 3. Creation Helper Functions ---
# (No changes to create_customer, create_accounts)

def create_customer(first_name, last_name):
    """Creates a new customer and returns the customer ID."""
    print("") # Adds newline for spacing
    print(f"[Creating customer '{first_name} {last_name}']")
    customer_payload = {
        "first_name": first_name,
        "last_name": last_name,
        "address": {
            "street_number": "123", "street_name": "Main St",
            "city": "Hometown", "state": "TX", "zip": "78701"
        }
    }
    customer_data = post_request('/customers', customer_payload)
    if not customer_data:
        print("  Failed to create customer.")
        return None
    
    customer_id = customer_data['objectCreated']['_id']
    print(f"  Customer '{first_name} {last_name}' created with ID: {customer_id}")
    return customer_id

def create_accounts(customer_id):
    """Creates checking and savings accounts for a customer."""
    print("") # Adds newline for spacing
    print(f"[Creating accounts for customer {customer_id}]")
    
    checking_payload = { "type": "Checking", "nickname": "First Job Checking", "rewards": 0, "balance": 0 }
    checking_data = post_request(f'/customers/{customer_id}/accounts', checking_payload)
    
    savings_payload = { "type": "Savings", "nickname": "My College Fund", "rewards": 0, "balance": 0 }
    savings_data = post_request(f'/customers/{customer_id}/accounts', savings_payload)

    if not checking_data or not savings_data:
        print("  Failed to create one or more accounts.")
        return None, None

    checking_account_id = checking_data['objectCreated']['_id']
    savings_account_id = savings_data['objectCreated']['_id']
    print(f"  Created Checking Account ID: {checking_account_id}")
    print(f"  Created Savings Account ID: {savings_account_id}")
    
    return checking_account_id, savings_account_id

# --- 4. Simulation Functions (Generate & Clear) ---

# --- Deposits ---
def generate_deposit_history(account_id):
    """Generates 9 bi-weekly deposits for a given account ID."""
    print("") # Adds newline for spacing
    print(f"[Generating deposit history for account {account_id}]")
    for i in range(9):
        pay_date = (datetime.date.today() - datetime.timedelta(days=(8-i) * 14)).isoformat()
        pay_amount = round(random.uniform(280.00, 310.00), 2)
        paycheck = {
            "medium": "balance", "transaction_date": pay_date,
            "amount": pay_amount, "description": "Paycheck - Burger Town"
        }
        post_request(f'/accounts/{account_id}/deposits', paycheck)
    print("  Simulated 9 bi-weekly deposits.")

# --- Purchases ---
def generate_random_purchases(account_id):
    """Generates 40 random purchases for a given account ID."""
    print("") # Adds newline for spacing
    print(f"[Generating 40 random purchases for account {account_id}]")
    purchase_options = [
        ("Steam Games", 29.99), ("Chipotle", 16.50), ("AMC Theaters", 14.00),
        ("Spotify Premium", 10.99), ("Amazon", 35.20), ("Starbucks", 7.80),
        ("McDonald's", 11.25), ("Gas Station", 45.00), ("Target", 55.10)
    ]
    generic_merchant_id = "57cf75cea73e494d8675ec4a" 

    for _ in range(40):
        vendor, base_amount = random.choice(purchase_options)
        amount = round(random.uniform(base_amount * 0.8, base_amount * 1.2), 2)
        purchase_date = (datetime.date.today() - datetime.timedelta(days=random.randint(1, 120))).isoformat()
        purchase_payload = {
            "merchant_id": generic_merchant_id, "medium": "balance",
            "purchase_date": purchase_date, "amount": amount,
            "description": f"{vendor}" 
        }
        post_request(f'/accounts/{account_id}/purchases', purchase_payload)
    print(f"  Simulated 40 random purchases.")
    
def generate_good_random_purchases(account_id):
    """Generates 40 good random purchases for a given account ID."""
    print("") # Adds newline for spacing
    print(f"[Generating 40 good random purchases for account {account_id}]")
    purchase_options = [
        ("HEB", 29.99), ("Staples", 16.50), ("Barnes and Nobles", 14.00),
        ("Kahn Academy", 10.99), ("Amazon", 35.20), ("Local Coffee Chain", 7.80),
        ("Trader Joes", 11.25), ("Gas Station", 45.00), ("Target", 55.10)
    ]
    generic_merchant_id = "57cf75cea73e494d8675ec4a" 

    for _ in range(40):
        vendor, base_amount = random.choice(purchase_options)
        amount = round(random.uniform(base_amount * 0.8, base_amount * 1.2), 2)
        purchase_date = (datetime.date.today() - datetime.timedelta(days=random.randint(1, 120))).isoformat()
        purchase_payload = {
            "merchant_id": generic_merchant_id, "medium": "balance",
            "purchase_date": purchase_date, "amount": amount,
            "description": f"{vendor}" 
        }
        post_request(f'/accounts/{account_id}/purchases', purchase_payload)
    print(f"  Simulated 40 good random purchases.")
    
def generate_bad_random_purchases(account_id):
    """Generates 40 bad random purchases for a given account ID."""
    print("") # Adds newline for spacing
    print(f"[Generating 40 bad random purchases for account {account_id}]")
    purchase_options = [
        ("Steam Games", 29.99), ("Ticketmaster", 16.50), ("Rolex", 140.00),
        ("Gamestop", 10.99), ("Spencers", 35.20), ("Wendys", 7.80),
        ("McDonalds", 11.25), ("Popmart Matcha Labubu", 67.00), ("AMC Theatres", 55.10)
    ]
    generic_merchant_id = "57cf75cea73e494d8675ec4a" 

    for _ in range(40):
        vendor, base_amount = random.choice(purchase_options)
        amount = round(random.uniform(base_amount * 0.8, base_amount * 1.2), 2)
        purchase_date = (datetime.date.today() - datetime.timedelta(days=random.randint(1, 120))).isoformat()
        purchase_payload = {
            "merchant_id": generic_merchant_id, "medium": "balance",
            "purchase_date": purchase_date, "amount": amount,
            "description": f"{vendor}" 
        }
        post_request(f'/accounts/{account_id}/purchases', purchase_payload)
    print(f"  Simulated 40 bad random purchases.")


# --- Transfers ---
def generate_transfer_history(payer_id, payee_id):
    """Generates 4 monthly transfers between two accounts."""
    print("") # Adds newline for spacing
    print(f"[Generating transfer history from {payer_id} to {payee_id}]")
    for i in range(4):
        transfer_date = (datetime.date.today() - datetime.timedelta(days=(i * 30) + 2)).isoformat()
        transfer_amount = round(random.uniform(100.00, 150.00), 2)
        transfer_payload = {
            "medium": "balance", "payee_id": payee_id,
            "amount": transfer_amount, "transaction_date": transfer_date,
            "description": "Monthly savings transfer"
        }
        post_request(f'/accounts/{payer_id}/transfers', transfer_payload)
    print("  Successfully simulated 4 monthly transfers.")


# --- NEW: Master Cleanup Function ---
# Replaces clear_purchase_history, clear_deposit_history, and clear_transfer_history
def clear_all_transaction_data():
    """Clears all transaction data for the entire API key."""
    print("") # Adds newline for spacing
    print("[--- Starting Data Cleanup (Wiping API Key Data) ---]")
    
    # We delete by type, as you suggested. This is much faster.
    print("  Clearing all Purchases...")
    delete_request('/data?type=Purchases')
    
    print("  Clearing all Deposits...")
    delete_request('/data?type=Deposits')
    
    print("  Clearing all Transfers...")
    delete_request('/data?type=Transfers')
    
    # Also clearing Withdrawals, as transfers can create these
    print("  Clearing all Withdrawals...")
    delete_request('/data?type=Withdrawals')
    
    print("[--- Data Cleanup Complete ---]")


# --- 5. Display Functions ---
# (No changes to display_deposit_history, display_purchase_history, display_transfer_history)

def display_deposit_history(account_id):
    """Fetches and prints the deposit history for an account."""
    print("") # Adds newline for spacing
    print(f"[Fetching Deposit History for {account_id}]")
    history = get_request(f'/accounts/{account_id}/deposits')
    
    if history:
        print(f"--- Deposit History for Account {account_id} ---")
        print(f"{'Date':<12} {'Amount':<10} {'Description'}")
        print("-" * 60)
        for item in reversed(history):
            date = item.get('transaction_date', 'N/A')
            amount = item.get('amount', 0)
            desc = item.get('description', 'N/A')
            print(f"{date:<12} ${amount:<9.2f} {desc}")
    else:
        print("  No deposit history found.")

def display_purchase_history(account_id):
    """Fetches and prints the purchase history for an account."""
    print("") # Adds newline for spacing
    print(f"[Fetching Purchase History for {account_id}]")
    history = get_request(f'/accounts/{account_id}/purchases')
    
    if history:
        print(f"--- Purchase History for Account {account_id} ---")
        print(f"{'Date':<12} {'Amount':<10} {'Description'}")
        print("-" * 60)
        for item in reversed(history):
            date = item.get('purchase_date', 'N/A')
            amount = item.get('amount', 0)
            desc = item.get('description', 'N/A')
            print(f"{date:<12} ${amount:<9.2f} {desc}")
    else:
        print("  No purchase history found.")

def display_transfer_history(account_id):
    """Fetches and prints the transfer history for an account."""
    print("") # Adds newline for spacing
    print(f"[Fetching Transfer History for {account_id}]")
    history = get_request(f'/accounts/{account_id}/transfers')
    
    if history:
        print(f"--- Transfer History for Account {account_id} ---")
        print(f"{'Date':<12} {'Amount':<10} {'Description'}")
        print("-" * 60)
        for item in reversed(history):
            date = item.get('transaction_date', 'N/A')
            amount = item.get('amount', 0)
            desc = item.get('description', 'N/A')
            print(f"{date:<12} ${amount:<9.2f} {desc}")
    else:
        print("  No transfer history found.")


# --- 6. Main Simulation Function ---

def main():
    """Runs the main financial simulation."""

    global EXISTING_CUSTOMER_ID, EXISTING_CHECKING_ID, EXISTING_SAVINGS_ID

    if API_KEY == 'YOUR_NESSIE_API_KEY':
        print("="*50)
        print("ERROR: Please update 'API_KEY' at the top of the script.")
        print("="*50)
        return

    print("Starting simulation...")
    print(f"Flags: Generate={Generate}, Get={Get}, Delete={Delete}")

    customer_id, checking_account_id, savings_account_id = "", "", ""

    # --- Setup Customer/Account IDs ---
    if EXISTING_CUSTOMER_ID and EXISTING_CHECKING_ID and EXISTING_SAVINGS_ID:
        print("") # Adds newline for spacing
        print("[Found existing IDs, loading them...]")
        customer_id = EXISTING_CUSTOMER_ID
        checking_account_id = EXISTING_CHECKING_ID
        savings_account_id = EXISTING_SAVINGS_ID
        print(f"Using Customer ID: {customer_id}")
    
    elif Generate:
        print("") # Adds newline for spacing
        print("[No existing IDs found, creating new customer & accounts...]")
        customer_id = create_customer("James", "Badman")
        if not customer_id: return 

        checking_account_id, savings_account_id = create_accounts(customer_id)
        if not checking_account_id or not savings_account_id:
            return 

        print("") # Adds newline for spacing
        print("="*50)
        print("  TO RE-USE THIS CUSTOMER, COPY THESE IDs")
        print("  INTO THE TOP OF THE SCRIPT FOR YOUR NEXT RUN:")
        print(f"  EXISTING_CUSTOMER_ID = \"{customer_id}\"")
        print(f"  EXISTING_CHECKING_ID = \"{checking_account_id}\"")
        print(f"  EXISTING_SAVINGS_ID =  \"{savings_account_id}\"")
        print("="*50) 
        
        EXISTING_CUSTOMER_ID = customer_id
        EXISTING_CHECKING_ID = checking_account_id
        EXISTING_SAVINGS_ID = savings_account_id
    
    else:
        print("") # Adds newline for spacing
        print("="*50)
        print("ERROR: 'Generate' is False and no IDs were provided.")
        print("Please provide 'EXISTING_CUSTOMER_ID', 'EXISTING_CHECKING_ID',")
        print("and 'EXISTING_SAVINGS_ID' at the top of the script")
        print("to run 'Get' or 'Delete' in isolation.")
        print("="*50)
        return # Stop the script

    # --- 1. Generate all simulation data ---
    if Generate:
        print("") # Adds newline for spacing
        print("--- [STAGE: GENERATE] ---")
        generate_random_purchases(checking_account_id)
        
        print("") # Adds newline for spacing
        print("[Waiting 5 seconds for API to sync after generation...]")
    else:
        print("") # Adds newline for spacing
        print("--- [SKIPPING: GENERATE] ---")
        
    if Generate_Deposit:
        print("") # Adds newline for spacing
        print("--- [STAGE: GENERATE DEPOSIT] ---")
        generate_deposit_history(checking_account_id)
        
        print("") # Adds newline for spacing
        print("[Waiting 5 seconds for API to sync after generation...]")
    else:
        print("") # Adds newline for spacing
        print("--- [SKIPPING: GENERATE DEPOSIT] ---")
        
    if Generate_Transfer:
        print("") # Adds newline for spacing
        print("--- [STAGE: GENERATE TRANSFER] ---")
        generate_transfer_history(checking_account_id, savings_account_id)
        
        print("") # Adds newline for spacing
        print("[Waiting 5 seconds for API to sync after generation...]")
    else:
        print("") # Adds newline for spacing
        print("--- [SKIPPING: GENERATE TRANSFER] ---")
        
    if Generate_Good:
        print("") # Adds newline for spacing
        print("--- [STAGE: GENERATE GOOD] ---")
        generate_good_random_purchases(checking_account_id)
        
        print("") # Adds newline for spacing
        print("[Waiting 5 seconds for API to sync after generation...]")
    else:
        print("") # Adds newline for spacing
        print("--- [SKIPPING: GENERATE GOOD] ---")
        
    if Generate_Bad:
        print("") # Adds newline for spacing
        print("--- [STAGE: GENERATE BAD] ---")
        generate_bad_random_purchases(checking_account_id)
        
        print("") # Adds newline for spacing
        print("[Waiting 5 seconds for API to sync after generation...]")
    else:
        print("") # Adds newline for spacing
        print("--- [SKIPPING: GENERATE BAD] ---")

    time.sleep(5)

    # --- 2. Get and Display ---
    if Get:
        print("") # Adds newline for spacing
        print("--- [STAGE: GET] ---")
        print("") # Adds newline for spacing
        print("[Fetching final account balances]")
        final_checking_data = get_request(f'/accounts/{checking_account_id}')
        final_savings_data = get_request(f'/accounts/{savings_account_id}')

        if final_checking_data and final_savings_data:
            print(f"Final Checking Balance: ${final_checking_data.get('balance', 0):.2f}")
            print(f"Final Savings Balance:  ${final_savings_data.get('balance', 0):.2f}")
        
        print("") # Adds newline for spacing
        print("[Fetching and displaying all transaction histories]")
        display_deposit_history(checking_account_id)
        display_purchase_history(checking_account_id)
        display_transfer_history(checking_account_id)
        display_deposit_history(savings_account_id)
    else:
        print("") # Adds newline for spacing
        print("--- [SKIPPING: GET] ---")

        
    # --- 3. Deletion ---
    if Delete:
        print("") # Adds newline for spacing
        print("--- [STAGE: DELETE] ---")
        
        if not Get and (Generate):
             print("[Waiting 5 seconds for API to sync before cleanup...]")
             time.sleep(5)
        
        # --- MODIFIED: Call the new master clear function ---
        clear_all_transaction_data()

    else:
        print("") # Adds newline for spacing
        print("--- [SKIPPING: DELETE] ---")

        
    print("") # Adds newline for spacing
    print("--- SIMULATION COMPLETE ---")

# --- 7. Run the main function ---
if __name__ == "__main__":
    main()