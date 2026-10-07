import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  // 1. Reset da API com dois underscores
  const resposta = await request.post("http://localhost:3000/__reset");
  expect(resposta.status()).toBe(204);

  // 2. Navegação via botão do menu na página inicial
  await page.goto("/");
  await page.getByRole("button", { name: "Clientes" }).click();
});

test("Atividade C1: listar os clientes iniciais", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(3);
  await expect(page.getByRole("cell", { name: "Ana Souza" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Bruno Lima" })).toBeVisible();
});

test("Atividade C2: cadastrar um cliente novo", async ({ page }) => {
  await page.getByLabel("Nome").fill("Carla Dias");
  await page.getByLabel("Email").fill("carla@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  const linha = page.getByRole("row", { name: /Carla Dias/ });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("carla@email.com");

  // Validação dos campos limpos após o cadastro
  await expect(page.getByLabel("Nome")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
});

test("Atividade C3: Validar campos obrigatorios", async ({ page }) => {
  await page.getByRole("button", { name: "Cadastrar" }).click();

  // Texto correto e chamada do método toBeVisible()
  await expect(page.getByText("Nome e email sao obrigatorios")).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(3);
});

test("Atividade C4: Impedir email duplicado", async ({ page }) => {
  await page.getByLabel("Nome").fill("Teste");
  await page.getByLabel("Email").fill("ana@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  await expect(page.getByText(/email j[aá] cadastrado/i)).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(3);
});

test("Atividade C5: editar um cliente", async ({ page }) => {
  const linhaBruno = page.getByRole("row", { name: /Bruno Lima/ });
  await linhaBruno.getByRole("button", { name: "Editar" }).click();

  await expect(page.getByLabel("Nome")).toHaveValue("Bruno Lima");
  await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cadastrar" })).not.toBeVisible();

  await page.getByLabel("Nome").fill("Bruno Lima Silva");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("cell", { name: "Bruno Lima Silva" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancelar" })).not.toBeVisible();
  await expect(page.getByLabel("Nome")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
});

test("C6: cancelar edição", async ({ page }) => {
  await page.getByRole("row", { name: /Ana Souza/ }).getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Nome").fill("Outro Nome");
  await page.getByRole("button", { name: "Cancelar" }).click();

  await expect(page.getByLabel("Nome")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
  await expect(page.getByRole("cell", { name: "Ana Souza" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Outro Nome" })).toHaveCount(0);
});

test("C7: editar para um email já usado", async ({ page }) => {
  await page.getByRole("row", { name: /Bruno/ }).getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Email").fill("ana@email.com");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Email ja cadastrado")).toBeVisible();
  const linhaBruno = page.getByRole("row", { name: /Bruno/ });
  await expect(linhaBruno).toContainText("bruno@email.com");
  await expect(linhaBruno).not.toContainText("ana@email.com");
});

test("C8: remover um cliente", async ({ page }) => {
  await page.getByRole("row", { name: /Bruno Lima/ }).getByRole("button", { name: "Remover" }).click();

  await expect(page.getByRole("row", { name: /Bruno/ })).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(2);
});