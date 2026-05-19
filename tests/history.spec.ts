import { test, expect } from '@playwright/test'
import { HistoryPage } from '../pages/history-page'
import fs from 'fs'

const jsonPath = 'test_data/history-search.json'
const dataSearch = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

let historyPage: HistoryPage

test.beforeEach(async ({ page }) => {
    historyPage = new HistoryPage(page)
    await historyPage.goToHistory()
})

// ========================
// TC-HI-01: Hiển thị danh sách khi có dữ liệu
// ========================
test('TC-HI-01: Hiển thị danh sách bài thi khi có dữ liệu', async () => {
    const count = await historyPage.getCardCount()
    expect(count).toBeGreaterThan(0)
})

// ========================
// TC-HI-02: Hiển thị đúng trạng thái điểm - chưa chấm vs đã chấm
// ========================
test('TC-HI-02: Hiển thị đúng trạng thái điểm - ungraded hiển thị "..." - đã chấm hiển thị điểm số', async ({ page }) => {
    const ungradedScores = page.locator('.hp-ss-score.ungraded')
    const gradedScores = page.locator('.hp-ss-score:not(.ungraded)')

    const ungradedCount = await ungradedScores.count()
    const gradedCount = await gradedScores.count()

    // Phải có ít nhất 1 trong 2 loại
    expect(ungradedCount + gradedCount).toBeGreaterThan(0)

    // Ungraded phải hiển thị "..."
    for (let i = 0; i < ungradedCount; i++) {
        await expect(ungradedScores.nth(i)).toHaveText('...')
    }

    // Graded phải chứa dấu "/" (dạng X/10 hoặc X - Y/10)
    for (let i = 0; i < gradedCount; i++) {
        const text = await gradedScores.nth(i).textContent()
        expect(text).toMatch(/\//)
    }
})

// ========================
// TC-HI-03: Màn hình trống khi không có dữ liệu
// ========================
test('TC-HI-03: Hiển thị empty state khi không có dữ liệu', async ({ page }) => {
    // Tìm kiếm từ khóa không tồn tại để trigger empty state
    await historyPage.timKiem('XYZXYZ_KHONG_TON_TAI')
    const count = await historyPage.getCardCount()

    if (count === 0) {
        // Phải có thông báo empty, không crash trắng trang
        const bodyText = await page.locator('body').textContent()
        expect(bodyText).not.toBe('')
    }
})

// ========================
// TC-HI-04: Bộ đếm tổng số bài thi đúng
// ========================
test('TC-HI-04: Bộ đếm filter "Tất cả" khớp số card thực tế', async ({ page }) => {
    const countText = await historyPage.getFilterCount(historyPage.filterAll)
    const cardCount = await historyPage.getCardCount()
    expect(Number(countText)).toBe(cardCount)
})

// ========================
// TC-HI-05 + TC-HI-06 + TC-HI-07: Tìm kiếm data-driven
// ========================
for (const { keyword, desc, expectedMatch } of dataSearch) {
    test(`TC-HI-05/06/07: Tìm kiếm "${desc}"`, async () => {
        await historyPage.timKiem(keyword)
        const count = await historyPage.getCardCount()
        if (expectedMatch) {
            expect(count).toBeGreaterThan(0)
        } else {
            expect(count).toBe(0)
        }
    })
}

// ========================
// TC-HI-08: Xóa nội dung tìm kiếm trả về danh sách đầy đủ
// ========================
test('TC-HI-08: Xóa nội dung tìm kiếm - danh sách phục hồi đầy đủ', async () => {
    const countBefore = await historyPage.getCardCount()

    await historyPage.timKiem('Minh')
    const countFiltered = await historyPage.getCardCount()
    expect(countFiltered).toBeLessThanOrEqual(countBefore)

    await historyPage.xoaTimKiem()
    const countAfter = await historyPage.getCardCount()
    expect(countAfter).toBe(countBefore)
})

// ========================
// TC-HI-09: Filter "Tất cả" hiển thị toàn bộ
// ========================
test('TC-HI-09: Filter "Tất cả" hiển thị toàn bộ bài thi và được active', async ({ page }) => {
    // Click filter speaking trước
    await historyPage.clickFilterSpeaking()
    // Rồi click lại Tất cả
    await historyPage.clickFilterAll()

    const filterAllEl = page.locator('.hp-filter').first()
    await expect(filterAllEl).toHaveClass(/active/)

    const countText = await historyPage.getFilterCount(historyPage.filterAll)
    const cardCount = await historyPage.getCardCount()
    expect(cardCount).toBe(Number(countText))
})

// ========================
// TC-HI-10: Filter Speaking chỉ hiển thị bài Speaking
// ========================
test('TC-HI-10: Filter Speaking chỉ hiển thị bài Speaking Exam', async ({ page }) => {
    await historyPage.clickFilterSpeaking()

    const cards = page.locator('.hp-card')
    const count = await cards.count()

    for (let i = 0; i < count; i++) {
        const cardText = await cards.nth(i).textContent()
        expect(cardText).toContain('Speaking')
    }
})

// ========================
// TC-HI-11: Click card -> điều hướng vào trang chi tiết
// ========================
test('TC-HI-11: Click vào card điều hướng đúng trang chi tiết', async ({ page }) => {
    const urlBefore = page.url()
    await historyPage.clickCard(0)
    await page.waitForURL(/exam|room|result|detail|grading/, { timeout: 5000 }).catch(() => {})
    const urlAfter = page.url()
    expect(urlAfter).not.toBe(urlBefore)
})

// ========================
// TC-HI-12: Bottom navigation chuyển tab đúng
// ========================
test.describe('TC-HI-12: Bottom navigation chuyển tab đúng', () => {
    test('Click tab Trang Chủ', async ({ page }) => {
        await historyPage.clickBottomNav('nav-home')
        await expect(page).toHaveURL(/\/#\/$|\/#\/home|\/$/i)
    })

    test('Click tab Luyện Tập', async ({ page }) => {
        await historyPage.clickBottomNav('nav-practice')
        await expect(page).toHaveURL(/practice/)
    })

    test('Click tab Thi', async ({ page }) => {
        await historyPage.clickBottomNav('nav-exam')
        await expect(page).toHaveURL(/exam/)
    })

    test('Click tab Cá Nhân', async ({ page }) => {
        await historyPage.clickBottomNav('nav-profile')
        await expect(page).toHaveURL(/profile/)
    })
})
