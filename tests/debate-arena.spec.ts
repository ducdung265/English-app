import { test, expect } from '@playwright/test';
import { DebateArenaPage } from '../pages/debate-arena';
import fs from 'fs'

const jsonPath = 'test_data/difficult.json'
const dataDiff = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
const jsonPath1 = 'test_data/name.json'
const dataName = JSON.parse(fs.readFileSync(jsonPath1, 'utf-8'))

let debateArenaPage: DebateArenaPage;

test.beforeEach(async ({ page }) => {
  debateArenaPage = new DebateArenaPage(page);
  await debateArenaPage.goToDebateArena();
});

// tạo phòng - text box nhập tên
test('Placeholder text trên ô nhập tên', async () => {
  await expect(debateArenaPage.placeholderName).toHaveAttribute('placeholder', 'Nhập tên của bạn...');
});

// kiểm tra button tạo phòng enable/disabled khi nhập tên
for (const { name, desc, isvalid } of dataName) {
  test(`Nhập tên: ${desc}`, async () => {
    await debateArenaPage.nhapTen(name)
    if (isvalid === true) {
      await expect(debateArenaPage.buttonTaoPhong).toBeEnabled()
    } else {
      await expect(debateArenaPage.buttonTaoPhong).toBeDisabled()
    }
  })
}

test('Button Tạo phòng disabled khi nhập rồi xóa tên', async () => {
  await debateArenaPage.nhapTen('121121')
  await debateArenaPage.xoaTen()
  await expect(debateArenaPage.buttonTaoPhong).toBeDisabled();
});

test('Nhập tên có khoảng trắng - tự động trim phần thừa', async () => {
  await debateArenaPage.nhapTen(' 121121 ')
  await debateArenaPage.placeholderName.blur()
  await expect(debateArenaPage.placeholderName).toHaveValue('121121')
  await expect(debateArenaPage.buttonTaoPhong).toBeEnabled()
})

// vào phòng
test('Đã nhập tên - nhập mã phòng ko tồn tại - hiển thị error msg', async () => {
  await debateArenaPage.nhapTen('111111')
  await debateArenaPage.nhapMaPhong('ABCD')
  await debateArenaPage.clickVaoPhong()
  await expect(debateArenaPage.errorMessage).toBeVisible();
})

test('Chưa nhập tên - nhập mã phòng ko tồn tại - button vào phòng disabled', async () => {
  await debateArenaPage.nhapTen('')
  await debateArenaPage.nhapMaPhong('ABCD')
  await expect(debateArenaPage.buttonVaoPhong).toBeDisabled();
})

test('Nhập mã phòng 5 ký tự - hiển thị tối đa 4 ký tự', async () => {
  await debateArenaPage.nhapTen('111111')
  await debateArenaPage.nhapMaPhong('ABCDE')
  await expect(debateArenaPage.inputMaPhong).toHaveValue('ABCD');
})

// chọn độ khó
for (const { difficult } of dataDiff) {
  test(`Chọn độ khó ${difficult}`, async () => {
    await debateArenaPage.chonDoKho(difficult)
    await expect(debateArenaPage.diffSlider).toHaveValue(difficult)
  })
}


