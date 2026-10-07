import { test, expect } from "@playwright/test";

let selCliente, selProduto, qtd;

test.beforeEach(async ({ page, request }) => {
  // Inclusão do reset do banco antes de cada teste de pedidos
  const resposta = await request.post("http://localhost:3000/__reset");
  expect(resposta.status()).toBe(204);

  await page.goto("/");
  // Navegação via botão do menu (não por link)
  await page.getByRole("button", { name: "Pedidos" }).click();
  await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();

  selCliente = page.getByLabel("Cliente");
  selProduto = page.getByLabel("Produto");
  qtd = page.getByLabel("Quantidade");

  await expect(selCliente).toContainText("Ana Souza");
  await expect(selProduto).toContainText("Coxinha");
});

const adicionar = async (page, produto, quantidade) => {
  await selProduto.selectOption({ label: produto });
  await qtd.fill(String(quantidade));
  await page.getByRole("button", { name: "Adicionar item" }).click();
};

test("P1: listar pedidos iniciais", async ({ page }) => {
  const linha = page.getByRole("row", { name: /Ana Souza/ });
  await expect(linha).toHaveCount(1);
  await expect(linha.getByRole("cell", { name: "#1" })).toBeVisible();
  await expect(linha).toContainText("2x Coxinha");
  await expect(page.getByRole("cell", { name: "R$ 10,00" })).toBeVisible();
  await expect(page.getByLabel("Status do pedido 1")).toHaveValue("pendente");
});

test("P2: pedido com um item", async ({ page }) => {
  await selCliente.selectOption({ label: "Bruno Lima" });
  await adicionar(page, "Pastel", 1);
  await expect(page.getByText("1x Pastel")).toBeVisible();

  await page.getByRole("button", { name: "Criar pedido" }).click();

  const linha = page.getByRole("row", { name: /Bruno Lima/ });
  await expect(linha).toContainText("1x Pastel");
  await expect(linha.getByRole("cell", { name: "R$ 8,00" })).toBeVisible();
  await expect(page.getByLabel("Status do pedido 2")).toHaveValue("pendente");

  await expect(selCliente).toHaveValue("");
  await expect(page.getByText("1x Pastel")).toHaveCount(1);
});

test("P3: vários itens e quantidades", async ({ page }) => {
  await selCliente.selectOption({ label: "Ana Souza" });
  await adicionar(page, "Coxinha", 3);
  await adicionar(page, "Empada", 1);
  await page.getByRole("button", { name: "Criar pedido" }).click();

  const nova = page.getByRole("row", { name: /3x Coxinha/ });
  await expect(nova).toContainText("3x Coxinha");
  await expect(nova).toContainText("1x Empada");
  await expect(nova.getByRole("cell", { name: "R$ 21,00" })).toBeVisible();
});

test("P4: quantidade volta a 1 após adicionar", async ({ page }) => {
  await selProduto.selectOption({ label: "Coxinha" });
  await qtd.fill("5");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(qtd).toHaveValue("1");
});

test("P5: não cria pedido sem cliente", async ({ page }) => {
  await adicionar(page, "Pastel", 1);
  await page.getByRole("button", { name: "Criar pedido" }).click();

  await expect(page.getByText("Cliente e obrigatorio")).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(2);
});

test("P6: não cria pedido sem itens", async ({ page }) => {
  await selCliente.selectOption({ label: "Ana Souza" });
  await page.getByRole("button", { name: "Criar pedido" }).click();

  await expect(page.getByText("Pedido deve ter ao menos um item")).toBeVisible();
});

test("P7: alterar status do pedido", async ({ page }) => {
  const status = page.getByLabel("Status do pedido 1");
  await status.selectOption("pago");
  await expect(status).toHaveValue("pago");
});

test("P8: pedido cancelado não pode ser alterado", async ({ page }) => {
  const status = page.getByLabel("Status do pedido 1");
  await status.selectOption("cancelado");
  await expect(status).toHaveValue("cancelado");

  await status.selectOption("pago");
  await expect(page.getByText("Pedido cancelado nao pode ser alterado")).toBeVisible();
  await expect(status).toHaveValue("cancelado");
});

test("P9: remover pedido", async ({ page }) => {
  await page.getByRole("row", { name: /Ana Souza/ }).getByRole("button", { name: "Remover" }).click();
  await expect(page.getByRole("row", { name: /Ana Souza/ })).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(1);
});