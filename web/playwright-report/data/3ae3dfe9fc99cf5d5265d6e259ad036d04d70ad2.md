# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: produtos.spec.js >> lista os produtos iniciais
- Location: e2e\produtos.spec.js:10:1

# Error details

```
Error: apiRequestContext.post: getaddrinfo ENOTFOUND localhost3000
Call log:
  - → POST http://localhost3000/_reset
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.12 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```

# Test source

```ts
  1  | import{test, expect} from "@playwright/test"
  2  | import { request } from "express"
  3  | 
  4  | test.beforeEach(async({page, request})=>{
> 5  |     const resposta = await request.post("http://localhost3000/_reset")
     |                                    ^ Error: apiRequestContext.post: getaddrinfo ENOTFOUND localhost3000
  6  |     expect(resposta.status()).toBe(204)
  7  |     await page.goto("/")
  8  | })
  9  | 
  10 | test("lista os produtos iniciais", async({page})=>{
  11 |     await expect(page.getByRole("heading",({name: "Produtos"}))).toBeVisible()
  12 |     await expect (page.getByRole("row")).toHaveCount(4)
  13 |     await expect(page.getByRole("cell", {name:"Coxinha"}))
  14 | })
  15 | 
  16 | test("cadastra um produto novo", async({page}) => {
  17 |     await page.getByLabel("Nome".fill("Kibe"));
  18 |     await page.getByLabel("Preco").fill("7");
  19 |     await page.getByLabel("button", {name: "Cadastrar"}).click();
  20 | 
  21 |     const linha = page.getByLabel("row", {name: /Kibe/ });
  22 |     await expect(linha).toBeVisible();
  23 |     await expect(linha).toContainText("R$ 7,00");
  24 | })
  25 | 
  26 | test("mostra erro ao cadastrar sem preenchimento", async ({page}) => {
  27 |     await page.getByRole("button", {name:"Cadastrar"}).click();
  28 |     await expect(page.getByText("Nome e preco sao obrigatorios")).toBeVisible
  29 | });
  30 | 
  31 | test("remove um produto", async ({page}) =>  {
  32 |     const linha = page.getByRole("row", {name: /Patel/});
  33 |     await linha.getByRole("button", {name: "Remover"}).click();
  34 |     await expect(linha).toHaveCount(0);
  35 | });
```