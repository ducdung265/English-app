import { type Page, type Locator, expect } from '@playwright/test'

export class HistoryPage {
    readonly page: Page
    readonly url: string
    readonly pageTitle: Locator
    readonly searchInput: Locator
    readonly filterAll: Locator
    readonly filterSpeaking: Locator
    readonly filterWriting: Locator
    readonly filterChat: Locator
    readonly cardList: Locator
    readonly firstCard: Locator
    readonly emptyState: Locator

    constructor(page: Page) {
        this.page = page
        this.url = 'https://app.hhm.beauty/#/history'
        this.pageTitle = page.locator('.hp-title')
        this.searchInput = page.locator('.hp-search')
        this.filterAll = page.locator('.hp-filter').first()
        this.filterSpeaking = page.locator('.hp-filter').nth(1)
        this.filterWriting = page.locator('.hp-filter').nth(2)
        this.filterChat = page.locator('.hp-filter').nth(3)
        this.cardList = page.locator('.hp-card')
        this.firstCard = page.locator('.hp-card').first()
        this.emptyState = page.locator('.hp-list')
    }

    async goToHistory() {
        await this.page.goto(this.url)
    }

    async timKiem(keyword: string) {
        await this.searchInput.fill(keyword)
    }

    async xoaTimKiem() {
        await this.searchInput.clear()
    }

    async clickFilterAll() {
        await this.filterAll.click()
    }

    async clickFilterSpeaking() {
        await this.filterSpeaking.click()
    }

    async clickFilterWriting() {
        await this.filterWriting.click()
    }

    async clickFilterChat() {
        await this.filterChat.click()
    }

    async clickCard(index: number = 0) {
        await this.cardList.nth(index).click()
    }

    async getCardCount(): Promise<number> {
        return await this.cardList.count()
    }

    async getFilterCount(filterLocator: Locator): Promise<string> {
        const countBadge = filterLocator.locator('.hp-count')
        return (await countBadge.textContent()) ?? ''
    }

    async clickBottomNav(tabId: string) {
        await this.page.locator(`#${tabId}`).click()
    }
}
