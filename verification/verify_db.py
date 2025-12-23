from playwright.sync_api import sync_playwright
import time
import json

def verify_db_switch():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("1. Setup Config (Local Mode)...")
            page.goto("http://localhost:5173/")

            # Setup Initial LocalStorage (Simulating existing DB)
            admin_user = {
                'id': 'admin-1',
                'email': 'gmotiaaa@gmail.com',
                'password': 'password',
                'role': 'admin',
                'name': 'Admin',
                'createdAt': '2023-01-01T00:00:00.000Z'
            }

            # Inject data
            page.evaluate(f"""
                localStorage.clear();
                const users = [{json.dumps(admin_user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
                // Force Reload to pick up local adapter logic
            """)
            page.reload()

            print("2. Login (Should work with LocalStorage)...")
            page.goto("http://localhost:5173/login")

            # Wait for hydration
            page.wait_for_selector('input[type="email"]', state='visible')

            page.fill('input[type="email"]', 'gmotiaaa@gmail.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')

            # Wait for navigation
            page.wait_for_url("**/admin", timeout=15000)

            print("SUCCESS: Login via LocalAdapter successful.")

            print("3. Verify Admin UI for DB Connection...")
            # Wait for the H1 header specifically
            page.wait_for_selector('h1:has-text("Dashboard")', timeout=20000)

            # Check for the DB Connection card text
            content = page.content()
            if "Database Connection" in content:
                print("SUCCESS: Admin Dashboard rendered.")
            else:
                raise Exception("Admin Dashboard missing 'Database Connection' section")

            page.screenshot(path="verification/db_check.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_db_switch.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_db_switch()
