from playwright.sync_api import sync_playwright
import json
import time

def verify_ui_polish():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a large viewport to see dashboard
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("1. Setup & Login...")
            page.goto("http://localhost:5173/")

            user = {
                'id': 'ui-user',
                'email': 'ui@example.com',
                'password': 'password',
                'role': 'admin',
                'name': 'UI Tester',
                'createdAt': '2023-01-01T00:00:00.000Z'
            }

            js_script = f"""
                localStorage.clear();
                const users = [{json.dumps(user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
                // Add some dummy chat history
                const chats = [{{
                    id: 'chat-1',
                    userId: 'ui-user',
                    title: 'Project Alpha Design',
                    messages: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }}];
                localStorage.setItem('brand_ai_chats', JSON.stringify(chats));
            """
            page.evaluate(js_script)

            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'ui@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')

            # Wait for dashboard
            page.wait_for_url("**/dashboard")
            page.wait_for_selector('text=Project Alpha Design', timeout=5000)

            print("2. Capture Dashboard UI...")
            # Capture Sidebar and Main Area
            page.screenshot(path="verification/ui_dashboard.png")

            print("3. Navigate to Admin...")
            page.goto("http://localhost:5173/admin")
            page.wait_for_selector('h1:has-text("Dashboard")', timeout=5000)

            print("4. Capture Admin UI...")
            page.screenshot(path="verification/ui_admin.png")

            print("SUCCESS: UI Polish Verified (Check Screenshots).")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_ui.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ui_polish()
