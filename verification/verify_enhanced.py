from playwright.sync_api import sync_playwright
import json
import time

def verify_enhanced_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("1. Setup Config...")
            page.goto("http://localhost:5173/")

            user = {
                'id': 'user-enhanced-1',
                'email': 'enhanced@example.com',
                'password': 'password',
                'role': 'user',
                'name': 'Enhanced User',
                'createdAt': '2023-01-01T00:00:00.000Z'
            }

            custom_models = [
                {'uuid': '1', 'name': 'Thinker Bot', 'id': 'gpt-4o', 'provider': 'openai'}
            ]

            js_script = f"""
                localStorage.clear();
                const users = [{json.dumps(user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
                localStorage.setItem('gaod_custom_models', JSON.stringify({json.dumps(custom_models)}));

                // Do NOT set keys -> Force Simulation
            """
            page.evaluate(js_script)

            print("2. Login...")
            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'enhanced@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')
            page.wait_for_url("**/dashboard")
            page.wait_for_timeout(1000)

            print("3. Test CoT Visualization (Simulation)...")
            # The simulation logic for CoT triggers if no key is present and response doesn't start with error.
            # I updated simulation logic to output <thinking> tags.

            page.fill('textarea', 'Help me plan a trip')
            page.click('button[type="submit"]')

            # Check for "Reasoning Process" visual block
            page.wait_for_selector('text=Reasoning Process', timeout=10000)
            print("SUCCESS: Reasoning Process block rendered.")

            # Click to toggle
            page.click('text=Reasoning Process')
            # Check if content is visible (checking for text inside thinking block from my simulation code)
            if page.is_visible('text=I should check if the user is asking for a specific task'):
                print("SUCCESS: Thinking content visible.")
            else:
                print("FAILURE: Thinking content not found.")

            print("4. Test Web Search Tool (Mock)...")
            page.fill('textarea', 'Search for apple')
            page.click('button[type="submit"]')

            page.wait_for_selector('text=Simulated Search Result', timeout=10000)
            print("SUCCESS: Web Search simulation triggered.")

            page.screenshot(path="verification/enhanced_check.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_enhanced.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_enhanced_features()
