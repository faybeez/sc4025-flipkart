import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({channel:'msedge',headless:true});
try {
  const context=await browser.newContext({viewport:{width:1280,height:1000}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const base=process.env.DEMO_URL || 'http://localhost:3001';
  await page.goto(`${base}/orders/details`);
  await page.getByLabel('Delivery state',{exact:true}).selectOption('confirmed');
  await page.getByRole('button',{name:'View Checks',exact:true}).click();
  await page.getByRole('heading',{name:'What to check',exact:true}).waitFor();
  await page.getByRole('button',{name:'Back to order details',exact:true}).click();
  await page.getByLabel('Delivery state',{exact:true}).selectOption('shipped');
  await page.getByLabel('Shipping progress',{exact:true}).selectOption('2');
  await page.getByText('Your item has reached the nearest delivery hub',{exact:true}).waitFor();
  await page.getByLabel('Delivery state',{exact:true}).selectOption('outForDelivery');
  await page.getByRole('button',{name:'Send a chat to driver'}).click();
  await page.getByLabel('Type a message',{exact:true}).fill('Please call when you arrive');
  await page.getByRole('button',{name:'Send message',exact:true}).click();
  await page.getByRole('log',{name:'Conversation'}).getByText('Please call when you arrive',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Back to delivery details'}).click();
  await page.getByLabel('Delivery state',{exact:true}).selectOption('cancelled');
  await page.getByRole('button',{name:/reschedule/i}).first().waitFor();
  await page.getByLabel('Delivery state',{exact:true}).selectOption('arrived');
  await page.getByLabel('Delivery state',{exact:true}).selectOption('delivered');
  await page.getByRole('button',{name:'Request a return',exact:true}).first().waitFor();
  await context.close();
  const driverContext=await browser.newContext({viewport:{width:1280,height:1000}});
  const driver=await driverContext.newPage();driver.on('pageerror',error=>errors.push(error.message));
  await driver.goto(`${base}/drivers`);
  await driver.getByRole('button',{name:'Parcels',exact:true}).last().click();
  await driver.getByRole('button',{name:'Start delivery',exact:true}).first().click();
  await driver.getByRole('heading',{name:'Start this delivery?'}).waitFor();
  await driver.locator('.driver-confirm-actions').getByRole('button',{name:'Start delivery',exact:true}).click();
  await driver.getByRole('heading',{name:'Current delivery',exact:true}).waitFor();
  await driver.getByRole('button',{name:'Open navigation',exact:true}).click();
  await driver.getByRole('button',{name:'Customer chat',exact:true}).last().click();
  await driver.getByLabel('Type a message',{exact:true}).fill('I’m 15 minutes away');
  await driver.getByRole('button',{name:'Send message',exact:true}).click();
  await driver.getByText('I’m 15 minutes away',{exact:true}).first().waitFor();
  assert.deepEqual(errors,[]);
  await driverContext.close();
  console.log('PASS: customer checks, manual delivery/shipping states, chat, cancellation, arrival, delivered, driver parcels/start/navigation/chat; no browser runtime errors.');
} finally {await browser.close();}


