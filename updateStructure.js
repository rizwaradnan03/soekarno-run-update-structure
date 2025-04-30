import xlsx from "xlsx";
import { v4 as uuidv4 } from "uuid";
import {Client} from "pg"

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "soekarno_before_migrating__",
  password: "",
  port: 5432
})

await client.connect()

const workBookUserPayment = xlsx.readFile("user_payments.xls");
const workBookUser = xlsx.readFile("users.xls");
const workBookProductCategories = xlsx.readFile("product_categories.xls");
const workBookProducts = xlsx.readFile("products.xls");
const workBookPersonalInformation = xlsx.readFile("personal_infomations.xls");
const workBookParqQuestion = xlsx.readFile("parq_questions.xls");

const workSheetUserPayment = workBookUserPayment.Sheets["user_payments"];
const workSheetUser = workBookUser.Sheets["users"];
const workSheetProductCategories = workBookProductCategories.Sheets["product_categories"];
const workSheetProducts = workBookProducts.Sheets["products"];
const workSheetPersonalInformation = workBookPersonalInformation.Sheets["personal_infomations"];
const workSheetParqQuestion = workBookParqQuestion.Sheets["parq_questions"];

const dataUserPayment = xlsx.utils.sheet_to_json(workSheetUserPayment, { header: 1 }) || [];
const dataUser = xlsx.utils.sheet_to_json(workSheetUser, { header: 1 }) || [];
const dataProductCategories = xlsx.utils.sheet_to_json(workSheetProductCategories, { header: 1 }) || [];
const dataProducts = xlsx.utils.sheet_to_json(workSheetProducts, { header: 1 }) || [];
const dataPersonalInformation = xlsx.utils.sheet_to_json(workSheetPersonalInformation, { header: 1 }) || [];
const dataParqQuestion = xlsx.utils.sheet_to_json(workSheetParqQuestion, { header: 1 }) || [];

let eventQuery = [];
let productCategoriesQuery = [];
let productsQuery = [];
let variantsQuery = [];
let usersQuery = [];
let userPaymentQuery = [];
let parqQuestionsQuery = [];
let personalInformationsQuery = [];

let personalInformationIds = []

eventQuery.push([
  1,
  "INSERT INTO events (id, title, location, address, started_at, ended_at, is_active) VALUES ('3d3b8134-9d02-4180-ab51-d6cd236df1e2', 'Soekarno Run Bandung', 'BANDUNG', 'Balai Kota Bandung', '2025-06-08', '2025-06-08', true);",
]);

productCategoriesQuery.push([
  1,
  "INSERT INTO product_categories VALUES ('18c12bb0-30cb-44e7-bc0f-eb1ce62856fe', '3d3b8134-9d02-4180-ab51-d6cd236df1e2', 'Fun Run', '2025-03-18', '2025-03-18');",
]);

let productId = uuidv4();
productsQuery.push([
  1,
  `INSERT INTO products (id, product_category_id, title, created_at, updated_at) VALUES ('${productId}', '18c12bb0-30cb-44e7-bc0f-eb1ce62856fe', '5K', '2025-06-08', '2025-06-08');`,
]);

let variantIds = []

for (let i = 1; i < dataProducts.length; i++) {
  variantIds.push(dataProducts[i][0])

  variantsQuery.push([
    i,
    `INSERT INTO variants (id, product_id, title, price, stock, ended_at, is_published, is_active, created_at, updated_at) VALUES ('${dataProducts[i][0]}', '${productId}', '${dataProducts[i][3]}', ${dataProducts[i][7]}, ${dataProducts[i][8]}, '2025-03-22', false, true, '2025-03-22', '2025-03-22');`,
  ]);
}

for (let i = 1; i < dataUser.length; i++) {
  usersQuery.push([
    i,
    `INSERT INTO users (id, role, email, password, refresh_token, created_at, updated_at) VALUES ('${dataUser[i][0]}', '${dataUser[i][1]}', '${dataUser[i][2]}', '${dataUser[i][3]}', '${dataUser[i][4]}', '2025-03-21', '2025-03-21');`,
  ]);
}

for (let i = 1; i < dataParqQuestion.length; i++) {
  parqQuestionsQuery.push([
    i,
    `INSERT INTO parq_questions (id, user_id, question_1, question_2, question_3, question_4, question_5, question_6, question_7, created_at, updated_at) VALUES ('${dataParqQuestion[i][0]}', '${dataParqQuestion[i][1]}', ${dataParqQuestion[i][2]}, ${dataParqQuestion[i][3]}, ${dataParqQuestion[i][4]}, ${dataParqQuestion[i][5]}, ${dataParqQuestion[i][6]}, ${dataParqQuestion[i][7]}, ${dataParqQuestion[i][8]}, '2025-03-20', '2025-03-20');`,
  ]);
}

for (let i = 1; i < dataPersonalInformation.length; i++) {
  let isDuplicated = false

  for(let j = 0;j < personalInformationIds.length;j++){
    if(dataPersonalInformation[i][1] == personalInformationIds[j]){
      isDuplicated = true
    }
  }

  if(!isDuplicated){
      personalInformationsQuery.push([
        i,
        `INSERT INTO personal_infomations (id, user_id, first_name, last_name, contact, gender, nationality, ktp, health_problem, community, name_of_emergency_contact, relation_of_emergency_contact, "emergencyContact", shirt_type, shirt_size, blood_type, created_at, updated_at) VALUES ('${dataPersonalInformation[i][0]}', '${dataPersonalInformation[i][1]}', '${dataPersonalInformation[i][2]}', '${dataPersonalInformation[i][3]}', '${dataPersonalInformation[i][4]}', '${dataPersonalInformation[i][5]}', '${dataPersonalInformation[i][6]}', '${dataPersonalInformation[i][7]}', '${dataPersonalInformation[i][8]}', '${dataPersonalInformation[i][11]}', '${dataPersonalInformation[i][12]}', '${dataPersonalInformation[i][13]}', '${dataPersonalInformation[i][14]}', '${dataPersonalInformation[i][15]}', '${dataPersonalInformation[i][16]}', '${dataPersonalInformation[i][9]}', '2025-03-20', '2025-03-20');`,
      ]);
      personalInformationIds.push(dataPersonalInformation[i][0])
  }
}

for(let i = 1;i < dataUserPayment.length;i++){
  userPaymentQuery.push([i,
    `INSERT INTO user_payments (id, order_id, variant_id, user_id, transaction_status, is_payed, is_qr_booked, gross_amount, payment_type, created_at, updated_at, bib_number) VALUES('${dataUserPayment[i][0]}', '${dataUserPayment[i][1]}', '${dataUserPayment[i][2]}', '${dataUserPayment[i][3]}', '${dataUserPayment[i][4] == true ? 'settlement' : 'expired' }',${dataUserPayment[i][4]}, ${dataUserPayment[i][5]}, ${dataUserPayment[i][6]}, '${dataUserPayment[i][7]}', '2025-03-21', '2025-03-21', '${dataUserPayment[i][8]}');`
  ])
}

const queries = async () => {
  let eventLogs = []
  for(let i = 0;i < eventQuery.length;i++){
    try {
      await client.query(eventQuery[i][1])
      console.log("Event Log : ", i)
      eventLogs.push([i, "success"])
    } catch (error) {
      eventLogs.push([i, "failed"])
    }
  }

  let productCategoryLogs = []
  for(let i = 0;i < productCategoriesQuery.length;i++){
    try {
      await client.query(productCategoriesQuery[i][1])
      console.log("Product Category Log : ", i)
      productCategoryLogs.push([i, "success"])
    } catch (error) {
      productCategoryLogs.push([i, "failed"])
    }
  }

  let productLogs = []
  for(let i = 0;i < productsQuery.length;i++){
    try {
      await client.query(productsQuery[i][1])
      console.log("Product Log : ", i)
      productLogs.push([i, "success"])
    } catch (error) {
      productLogs.push([i, "failed"])
    }
  }

  let variantLogs = []
  for(let i = 0;i < variantsQuery.length;i++){
    try {
      await client.query(variantsQuery[i][1])
      console.log("Variant Log : ", i)
      variantLogs.push([i, "success"])
    } catch (error) {
      variantLogs.push([i, "failed"])
    }
  }

  let userLogs = []
  for(let i = 0;i < usersQuery.length;i++){
    try {
      await client.query(usersQuery[i][1])
      console.log("User Log : ", i)
      userLogs.push([i, "success"])
    } catch (error) {
      userLogs.push([i, "failed"])
    }
  }

  let parqQuestionLogs = []
  for(let i = 0;i < parqQuestionsQuery.length;i++){
    try {
      await client.query(parqQuestionsQuery[i][1])
      console.log("Parq Question Log : ", i)
      parqQuestionLogs.push([i, "success"])
    } catch (error) {
      parqQuestionLogs.push([i, "failed"])
    }
  }

  let personalInformationLogs = []
  for(let i = 0;i < personalInformationsQuery.length;i++){
    try {
      await client.query(personalInformationsQuery[i][1])
      console.log("Personal Information Log : ", i)
      personalInformationLogs.push([i, "success"])
    } catch (error) {
      personalInformationLogs.push([i, "failed"])
    }
  }

  let userPaymentLogs = []
  for(let i = 0;i < userPaymentQuery.length;i++){
    try {
      await client.query(userPaymentQuery[i][1])
      console.log("User Payment Log : ", i)
      userPaymentLogs.push([i, "success"])
    } catch (error) {
      userPaymentLogs.push([i, "failed"])
    }
  }
}

queries()

// console.log("Parq Question", )

// const finalWorkbook = xlsx.utils.book_new();

// xlsx.utils.book_append_sheet(finalWorkbook, xlsx.utils.aoa_to_sheet(eventQuery), "Events");
// xlsx.utils.book_append_sheet(finalWorkbook, xlsx.utils.aoa_to_sheet(productCategoriesQuery), "ProductCategories");
// xlsx.utils.book_append_sheet(finalWorkbook, xlsx.utils.aoa_to_sheet(productsQuery), "Products");
// xlsx.utils.book_append_sheet(finalWorkbook, xlsx.utils.aoa_to_sheet(variantsQuery), "Variants");
// xlsx.utils.book_append_sheet(finalWorkbook, xlsx.utils.aoa_to_sheet(usersQuery), "Users");
// xlsx.utils.book_append_sheet(finalWorkbook, xlsx.utils.aoa_to_sheet(parqQuestionsQuery), "ParqQuestions");
// xlsx.utils.book_append_sheet(finalWorkbook, xlsx.utils.aoa_to_sheet(personalInformationsQuery), "PersonalInformations");

// // 12. Simpan workbook ke file .xlsx
// const fileName = `before-migrating.xlsx`;
// xlsx.writeFile(finalWorkbook, fileName);
// console.log("✅ Export complete:", fileName);
// await client.end()