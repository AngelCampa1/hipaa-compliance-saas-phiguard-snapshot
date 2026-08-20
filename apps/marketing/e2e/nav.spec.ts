import { expect, test } from '@playwright/test'
import { primaryNavLinks, resourcesMegaMenuGroups } from '../src/lib/internal-links'

const desktopResourcesLinkCount = resourcesMegaMenuGroups.reduce(
  (count, group) => count + 1 + group.links.length,
  0,
)
const mobileResourcesLinkCount = resourcesMegaMenuGroups.reduce(
  (count, group) => count + 1 + Math.min(group.links.length, 2),
  0,
)
const mobileMenuLinkCount = primaryNavLinks.length + mobileResourcesLinkCount + 2

test('desktop resources megamenu exposes crawlable hub links', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')

  const resourcesLink = page
    .getByRole('navigation', { name: /main navigation/i })
    .getByRole('link', { name: /^Resources$/ })
  await resourcesLink.hover()

  const menu = page.locator('#resources-mega-menu')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('link', { name: /^Vendor Guides$/ })).toHaveAttribute('href', '/resources/guides')
  await expect(menu.getByRole('link', { name: /^Best Software$/ })).toHaveAttribute('href', '/resources/best')
  await expect(menu.getByRole('link', { name: /^Compare & Fit$/ })).toHaveAttribute('href', '/compare')
  await expect(menu.getByRole('link', { name: /^All free tools/ })).toHaveAttribute('href', '/resources/tools')
  await expect(menu.getByRole('link', { name: /^Alternatives/ })).toHaveAttribute('href', '/alternatives')
  await expect(menu.getByRole('link', { name: /Glossary/ })).toHaveAttribute('href', '/glossary')
  await expect(menu.getByRole('link')).toHaveCount(desktopResourcesLinkCount)
})

test('mobile menu includes nested resources links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await page.getByRole('button', { name: /open menu/i }).click()

  const mobileMenu = page.locator('#mobile-menu')
  await expect(mobileMenu).toBeVisible()
  await expect(mobileMenu.getByRole('link', { name: /^Resources$/ })).toHaveAttribute('href', '/resources')
  await expect(mobileMenu.getByRole('link', { name: /^Vendor Guides$/ })).toHaveAttribute('href', '/resources/guides')
  await expect(mobileMenu.getByRole('link', { name: /^Best Software$/ })).toHaveAttribute('href', '/resources/best')
  await expect(mobileMenu.getByRole('link', { name: /^Compare & Fit$/ })).toHaveAttribute('href', '/compare')
  await expect(mobileMenu.getByRole('link', { name: /^All free tools$/ })).toHaveAttribute('href', '/resources/tools')
  await expect(mobileMenu.getByRole('link', { name: /^Alternatives$/ })).toHaveAttribute('href', '/alternatives')
  await expect(mobileMenu.getByRole('link')).toHaveCount(mobileMenuLinkCount)
})
