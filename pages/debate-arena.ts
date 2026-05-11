import { type Page, type Locator, expect } from '@playwright/test'

export class DebateArenaPage {
    readonly page: Page
    readonly url: string
    readonly placeholderName: Locator
    readonly buttonTaoPhong: Locator
    readonly inputName: Locator
    readonly inputMaPhong: Locator
    readonly buttonVaoPhong: Locator
    readonly errorMessage: Locator
    readonly diffSlider: Locator
    readonly diffLevel: Locator


    constructor(page: Page) {
        this.page = page
        this.url = 'https://app.hhm.beauty/#/debate'
        this.placeholderName = page.getByRole('textbox', { name: "Nhập tên của bạn..." })
        this.buttonTaoPhong = page.getByRole('button', { name: 'Tạo phòng' })
        this.inputName = page.getByPlaceholder('Nhập tên của bạn...')
        this.inputMaPhong = page.getByRole('textbox', { name: 'Nhập mã phòng' })
        this.buttonVaoPhong = page.getByRole('button', { name: 'Vào phòng' })
        this.errorMessage = page.getByText('Room not found')
        this.diffSlider = page.getByRole('slider')
        this.diffLevel = page.locator('span.diff-level')

    }

    async goToDebateArena() {
        await this.page.goto(this.url)
    }

    async nhapTen(name: string) {
        await this.inputName.fill(name)
    }

    async xoaTen() {
        await this.inputName.clear()
    }

    async nhapMaPhong(code: string) {
        await this.inputMaPhong.fill(code)
    }

    async clickVaoPhong() {
        await this.buttonVaoPhong.click()
    }

    async chonDoKho(difficult: string) {
        await this.diffSlider.fill(difficult)
    }


}