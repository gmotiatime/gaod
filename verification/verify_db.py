from playwright.sync_api import sync_playwright
import json
import time

def verify_db_switch():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("1. Setup Config (Local Mode)...")
            page.goto("http://localhost:5173/")

            # Use LocalStorage to inject data
            user = {
                'id': 'user-db-1',
                'email': 'dbuser@example.com',
                'password': 'password',
                'role': 'user',
                'name': 'DB User',
                'createdAt': '2023-01-01T00:00:00.000Z'
            }

            js_script = f"""
                localStorage.clear();
                const users = [{json.dumps(user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
            """
            page.evaluate(js_script)

            print("2. Login (Should work with LocalStorage)...")
            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'dbuser@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')
            page.wait_for_url("**/dashboard")
            print("SUCCESS: Login via LocalAdapter successful.")

            print("3. Verify Admin UI for DB Connection...")
            # We need to be admin.
            admin_user = user.copy()
            admin_user['role'] = 'admin'
            admin_user['email'] = 'dbadmin@example.com'

            js_admin = f"""
                const users = [{json.dumps(admin_user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
                localStorage.removeItem('brand_ai_session');
            """
            page.evaluate(js_admin)

            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'dbadmin@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')

            # Wait for Admin Redirect
            page.wait_for_url(lambda url: "/admin" in url or "/dashboard" in url)
            if "/admin" not in page.url:
                page.goto("http://localhost:5173/admin")

            # Wait for Loading state to disappear (h1 is a good indicator)
            page.wait_for_selector('h1:has-text("Admin Dashboard")', timeout=10000)

            # Check Tabs/Sections
            if page.is_visible('text=Database Connection'):
                print("SUCCESS: Database Connection tab visible.")
            else:
                print("FAILURE: Database tab missing.")

            # Check Test Connection Button
            if page.is_visible('button:has-text("Test & Connect")'):
                print("SUCCESS: Test Connection button visible.")
            else:
                print("FAILURE: Test Connection button missing.")

            page.screenshot(path="verification/db_check.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_db.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_db_switch()
