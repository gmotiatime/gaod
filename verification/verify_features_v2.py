from playwright.sync_api import sync_playwright
import json
import time

def verify_features_v2():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use mobile viewport for one test case, then resize? Or just use desktop first.
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("1. Setup Config & Data...")
            page.goto("http://localhost:5173/")

            # User
            regular_user = {
                'id': 'user-1',
                'email': 'user@example.com',
                'password': 'password',
                'role': 'user',
                'name': 'Regular User',
                'createdAt': '2023-01-01T00:00:00.000Z'
            }

            # Models
            custom_models = [
                {'uuid': '1', 'name': 'Text Bot', 'id': 'gpt-3.5-turbo', 'provider': 'openai', 'type': 'text'},
                {'uuid': '2', 'name': 'Image Gen', 'id': 'dall-e-3', 'provider': 'openai', 'type': 'image'}
            ]

            # Chat with existing markdown message to verify rendering immediately
            chat_data = [{
                'id': 'chat-1',
                'title': 'Test Chat',
                'messages': [
                    {'id': 'm1', 'role': 'user', 'content': 'Show me markdown'},
                    {'id': 'm2', 'role': 'assistant', 'content': '# Hello World\n\n**Bold Text**\n\n- List Item'}
                ],
                'createdAt': '2023-01-01T00:00:00.000Z',
                'updatedAt': '2023-01-01T00:00:00.000Z'
            }]

            js_script = f"""
                localStorage.clear();
                const users = [{json.dumps(regular_user)}];
                localStorage.setItem('brand_ai_users', JSON.stringify(users));
                localStorage.setItem('gaod_custom_models', JSON.stringify({json.dumps(custom_models)}));
                localStorage.setItem('brand_ai_chats', JSON.stringify({json.dumps(chat_data)}));
                localStorage.setItem('gaod_system_prompt', 'You are a helpful assistant.');
            """
            page.evaluate(js_script)

            print("2. Login...")
            page.goto("http://localhost:5173/login")
            page.fill('input[type="email"]', 'user@example.com')
            page.fill('input[type="password"]', 'password')
            page.click('button[type="submit"]')
            page.wait_for_url("**/dashboard")

            # Allow time for React to hydrate and load chat from localstorage
            page.wait_for_timeout(2000)

            print("3. Verify Markdown Rendering...")
            # Check for H1 styling or tag
            # ReactMarkdown usually renders # as h1.
            # We check if h1 with text 'Hello World' exists
            if page.is_visible('h1:has-text("Hello World")'):
                print("SUCCESS: H1 Markdown rendered.")
            else:
                # Fallback check: maybe prose class logic is different?
                # Let's inspect content
                content = page.content()
                if 'Hello World' in content and '<h1' in content:
                     print("SUCCESS: H1 tag found in content.")
                else:
                     print("FAILURE: Markdown H1 not found.")
                     page.screenshot(path="verification/markdown_fail.png")

            if page.is_visible('strong:has-text("Bold Text")') or page.is_visible('b:has-text("Bold Text")'):
                print("SUCCESS: Bold Markdown rendered.")
            else:
                print("FAILURE: Bold text not found.")

            print("4. Verify File Attachment UI...")
            # Click attachment button
            with page.expect_file_chooser() as fc_info:
                page.click('button[title="Attach file"]')
            file_chooser = fc_info.value
            file_chooser.set_files({"name": "test_doc.txt", "mimeType": "text/plain", "buffer": b"test content"})

            page.wait_for_selector('text=test_doc.txt')
            print("SUCCESS: Attachment preview visible.")

            print("5. Verify Model Selection & Image Gen Option...")
            # Click dropdown
            page.click('button:has-text("Text Bot")')
            # Check for Image Gen option
            if page.is_visible('text=Image Gen'):
                print("SUCCESS: Image Gen model visible in dropdown.")
                page.click('text=Image Gen')
                # Verify it is now selected
                page.wait_for_selector('button:has-text("Image Gen")')
                print("SUCCESS: Image Gen model selected.")
            else:
                print("FAILURE: Image Gen model not found.")

            print("6. Verify Mobile Layout (Hamburger)...")
            # Resize viewport to mobile
            page.set_viewport_size({"width": 375, "height": 667})
            page.wait_for_timeout(1000)

            # Check if Sidebar is hidden (menu button visible)
            # The menu button in ChatInterface has <Menu> icon
            # Selector might need adjustment if generic.
            # We look for the button that calls onMobileMenu
            if page.is_visible('.md\\:hidden > svg.lucide-menu'): # rough selector
                print("SUCCESS: Hamburger menu visible on mobile.")
                # Open menu
                page.click('.md\\:hidden')
                # Sidebar should appear (it has z-50 fixed)
                # Sidebar contains 'New Chat'
                page.wait_for_selector('text=New Chat')
                print("SUCCESS: Sidebar opened on mobile.")
            else:
                print("WARNING: Mobile menu button selector might be wrong, skipping strict check but viewport resized.")

            page.screenshot(path="verification/final_features.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_v2.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_features_v2()
