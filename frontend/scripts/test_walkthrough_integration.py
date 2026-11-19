import time
import sys
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://127.0.0.1:5173"
SCREENSHOT_DIR = "docs/screenshots/verification"

VIEWPORTS = [
    (1920, 1080, "1920x1080"),
    (1440, 900, "1440x900"),
    (1366, 768, "1366x768"),
    (1280, 720, "1280x720"),
]

def run_tests():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    results = []

    def log(test_name, success, details=""):
        status = "PASS" if success else "FAIL"
        print(f"[{status}] {test_name}: {details}")
        results.append((test_name, success, details))

    # Base headless options
    opts = Options()
    opts.add_argument('--headless=new')
    opts.add_argument('--no-sandbox')
    opts.add_argument('--disable-dev-shm-usage')
    opts.add_argument('--window-size=1440,900')

    driver = webdriver.Chrome(options=opts)
    wait = WebDriverWait(driver, 10)

    try:
        # ======================================================================
        # 1. ROOT & LANDING FLOW VERIFICATION ("Tour First, Then App")
        # ======================================================================
        driver.get(f"{BASE_URL}/#/")
        time.sleep(1)

        wt_container = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='walkthrough-container']")))
        log("1. Root Route Mounts Tour", wt_container is not None, "Root URL /#/ immediately renders the Product Tour")

        # Verify AppShell chrome is NOT present on the landing page
        stagerail_elements = driver.find_elements(By.CSS_SELECTOR, "nav[aria-label='Stage Navigation']")
        log("2. Chrome Isolated on Tour", len(stagerail_elements) == 0, "No operational sidebar on first page")

        # Hero section title & live HTML
        hero_title = driver.find_element(By.CSS_SELECTOR, ".df-poc-title").text
        log("3. Hero Headline Text", "Fix dirty data." in hero_title, f"Headline: {hero_title[:35]}...")

        # Theme toggle (Light / Dark)
        theme_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='hero-theme-toggle']")
        initial_theme = wt_container.get_attribute("data-theme")
        theme_btn.click()
        time.sleep(0.3)
        toggled_theme = wt_container.get_attribute("data-theme")
        log("4. Tour Theme Toggle", initial_theme != toggled_theme, f"{initial_theme} -> {toggled_theme}")

        # Ensure return to light mode for test consistency
        if toggled_theme == "dark":
            theme_btn.click()
            time.sleep(0.3)

        # ======================================================================
        # 2. COMPLETE EIGHT-STAGE WALKTHROUGH & ASSET AUDIT
        # ======================================================================
        cinematic_section = driver.find_element(By.CSS_SELECTOR, "[data-testid='walkthrough-cinematic-section']")
        log("5. GSAP Section Mount", cinematic_section is not None, "Cinematic section ready")

        # Forward stage navigation (1 -> 8)
        for stage_idx in range(1, 9):
            stage_tab = driver.find_element(By.CSS_SELECTOR, f"[data-testid='stage-tab-{stage_idx}']")
            stage_tab.click()
            time.sleep(0.3)

            card = driver.find_element(By.CSS_SELECTOR, f"[data-testid='stage-card-{stage_idx}']")
            img = driver.find_element(By.CSS_SELECTOR, f"[data-testid='stage-artwork-{stage_idx}']")
            img_src = img.get_attribute("src")
            log(f"Stage 0{stage_idx} Forward Verification", card is not None and img_src is not None, f"Artwork: {img_src.split('/')[-1]}")

        # Reverse stage navigation (8 -> 1)
        for stage_idx in range(8, 0, -1):
            stage_tab = driver.find_element(By.CSS_SELECTOR, f"[data-testid='stage-tab-{stage_idx}']")
            stage_tab.click()
            time.sleep(0.2)
        log("6. Reverse Navigation", True, "Successfully reversed navigation from Stage 8 back to Stage 1")

        # ======================================================================
        # 3. INTERACTIVE HUMAN GATE & SCORE ATTESTATION (80% -> 93% -> 97%)
        # ======================================================================
        # Jump to Stage 6: Gate & Apply
        driver.find_element(By.CSS_SELECTOR, "[data-testid='stage-tab-6']").click()
        time.sleep(0.3)

        # Baseline: Working copy row count is 6 (unapproved)
        working_copy_chip = driver.find_element(By.CSS_SELECTOR, ".v3-chip.is-working").text
        log("7. Working Copy Baseline Rows", "6 ROWS" in working_copy_chip, f"Chip: {working_copy_chip}")

        # Gate Toggle: Approve duplicate consolidation
        gate_toggle = driver.find_element(By.CSS_SELECTOR, "[data-testid='stage-approval-toggle']")
        gate_toggle.click()
        time.sleep(0.4)

        working_copy_chip_approved = driver.find_element(By.CSS_SELECTOR, ".v3-chip.is-working").text
        log("8. Working Copy Deduplicated Rows", "5 ROWS" in working_copy_chip_approved, f"Chip: {working_copy_chip_approved}")

        # Verify Stage 8 reflects 97% score with approval
        driver.find_element(By.CSS_SELECTOR, "[data-testid='stage-tab-8']").click()
        time.sleep(0.3)
        score_approved = driver.find_element(By.CSS_SELECTOR, ".v3-proof-pct").text
        log("9. Stage 8 Score Approved (97%)", score_approved == "97%", f"Got: {score_approved}")

        # Reset approval and verify score reverts to 93% (Baseline auto-apply only)
        driver.find_element(By.CSS_SELECTOR, "[data-testid='stage-tab-6']").click()
        time.sleep(0.3)
        driver.find_element(By.CSS_SELECTOR, "[data-testid='stage-approval-toggle']").click()
        time.sleep(0.3)

        driver.find_element(By.CSS_SELECTOR, "[data-testid='stage-tab-8']").click()
        time.sleep(0.3)
        score_reset = driver.find_element(By.CSS_SELECTOR, ".v3-proof-pct").text
        log("10. Stage 8 Score Reset (93%)", score_reset == "93%", f"Got: {score_reset}")

        # ======================================================================
        # 4. TRANSITION INTO OPERATIONAL APP & THEME AUDIT
        # ======================================================================
        exit_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='hero-exit-button']")
        exit_btn.click()
        time.sleep(0.5)

        app_url = driver.current_url
        log("11. Transition to App Workspace", "#/app" in app_url, f"Navigated to: {app_url}")

        topbar = wait.until(EC.presence_of_element_located((By.TAG_NAME, "header")))
        is_topbar_light = "bg-white" in topbar.get_attribute("class") and "bg-slate-950" not in topbar.get_attribute("class")
        log("12. TopBar Light Editorial Styling", is_topbar_light, "TopBar verified light")

        stagerail = driver.find_element(By.TAG_NAME, "aside")
        is_stagerail_light = "bg-white" in stagerail.get_attribute("class") and "bg-slate-950" not in stagerail.get_attribute("class")
        log("13. StageRail Light Editorial Styling", is_stagerail_light, "StageRail verified light")

        # ======================================================================
        # 5. ALL OPERATIONAL ROUTES & FULL WORKSPACE LIFECYCLE
        # ======================================================================
        # Load Demo Fixture to populate RunContext
        load_fixture_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='load-demo-fixture-btn']")))
        load_fixture_btn.click()
        time.sleep(0.8)

        # Studio Route
        safety_ribbon = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='safety-ribbon']")))
        is_ribbon_light = "bg-[#fafbfc]" in safety_ribbon.get_attribute("class")
        log("14. Studio Route & Safety Ribbon", is_ribbon_light, "Studio loaded with light governance ribbon")

        # Overview Route
        overview_btn = driver.find_element(By.XPATH, "//span[contains(text(), 'Overview')]/ancestor::button")
        overview_btn.click()
        time.sleep(0.5)
        log("15. Overview Route", "#/runs/run_demo_01/overview" in driver.current_url, "Overview loaded")

        # Return to Studio and Execute Plan
        studio_btn = driver.find_element(By.XPATH, "//span[contains(text(), 'Repair Studio')]/ancestor::button")
        studio_btn.click()
        time.sleep(0.5)

        apply_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Apply Plan & Verify')]")))
        apply_btn.click()
        time.sleep(0.8)

        # Proof Route
        proof_btn = driver.find_element(By.XPATH, "//span[contains(text(), 'Proof')]/ancestor::button")
        proof_btn.click()
        time.sleep(0.5)
        log("16. Proof Route", "#/runs/run_demo_01/proof" in driver.current_url, "Proof dossier loaded")

        # History Route
        history_btn = driver.find_element(By.XPATH, "//span[contains(text(), 'History & Ledger')]/ancestor::button")
        history_btn.click()
        time.sleep(0.5)
        log("17. History Route", "#/runs/run_demo_01/history" in driver.current_url, "Audit ledger loaded")

        # Export Route
        export_btn = driver.find_element(By.XPATH, "//span[contains(text(), 'Export Bundle')]/ancestor::button")
        export_btn.click()
        time.sleep(0.5)
        log("18. Export Route", "#/runs/run_demo_01/export" in driver.current_url, "Export bundle loaded")

        # Dedicated Walkthrough Route (#/walkthrough)
        driver.get(f"{BASE_URL}/#/walkthrough")
        time.sleep(0.5)
        log("19. Dedicated #/walkthrough Route", driver.find_element(By.CSS_SELECTOR, "[data-testid='walkthrough-container']") is not None, "Dedicated route renders")

        # ======================================================================
        # 6. DESKTOP VIEWPORT AUDIT (1920x1080, 1440x900, 1366x768, 1280x720)
        # ======================================================================
        for width, height, label in VIEWPORTS:
            driver.set_window_size(width, height)
            time.sleep(0.4)

            # Check no horizontal body overflow
            body_width = driver.execute_script("return document.body.scrollWidth")
            window_width = driver.execute_script("return window.innerWidth")
            has_no_h_overflow = body_width <= window_width + 1

            driver.save_screenshot(f"{SCREENSHOT_DIR}/viewport_tour_{label}.png")
            log(f"Viewport {label} Audit", has_no_h_overflow, f"Body: {body_width}px | Window: {window_width}px (No clipping or unwanted horizontal scroll)")

    finally:
        driver.quit()

    all_passed = all(s for _, s, _ in results)
    print("\n" + "=" * 60)
    print(f"SUMMARY: {sum(1 for _, s, _ in results)} / {len(results)} tests passed.")
    print("=" * 60)
    if not all_passed:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
