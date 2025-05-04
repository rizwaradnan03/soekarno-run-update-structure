import xlsx from "xlsx";
import { v4 as uuidv4 } from "uuid";
import { Client } from "pg";

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "soekarno_before_migrating__",
  password: "",
  port: 5432,
});

await client.connect();

const workBook = {
  userPayment: xlsx.readFile("user_payments.xls"),
  user: xlsx.readFile("users.xls"),
  productCategories: xlsx.readFile("product_categories.xls"),
  products: xlsx.readFile("products.xls"),
  personalInformation: xlsx.readFile("personal_infomations.xls"),
  parqQuestion: xlsx.readFile("parq_questions.xls"),
  midtrans: xlsx.readFile("transaction-report.xls"),
};

const workSheet = {
  userPayment: workBook.userPayment.Sheets["user_payments"],
  user: workBook.user.Sheets["users"],
  productCategories: workBook.productCategories.Sheets["product_categories"],
  products: workBook.products.Sheets["products"],
  personalInformation:
    workBook.personalInformation.Sheets["personal_infomations"],
  parqQuestion: workBook.parqQuestion.Sheets["parq_questions"],
  midtrans: workBook.midtrans.Sheets["transaction-report"],
};

const data = {
  userPayment:
    xlsx.utils.sheet_to_json(workSheet.userPayment, { header: 1 }) || [],
  user: xlsx.utils.sheet_to_json(workSheet.user, { header: 1 }) || [],
  productCategories:
    xlsx.utils.sheet_to_json(workSheet.productCategories, { header: 1 }) || [],
  products: xlsx.utils.sheet_to_json(workSheet.products, { header: 1 }) || [],
  personalInformation:
    xlsx.utils.sheet_to_json(workSheet.personalInformation, { header: 1 }) ||
    [],
  parqQuestion:
    xlsx.utils.sheet_to_json(workSheet.parqQuestion, { header: 1 }) || [],
  midtrans: xlsx.utils.sheet_to_json(workSheet.midtrans, { header: 1 }) || [],
};

let eventQuery = [];
let productCategoriesQuery = [];
let productsQuery = [];
let variantsQuery = [];
let usersQuery = [];
let userPaymentQuery = [];
let parqQuestionsQuery = [];
let personalInformationsQuery = [];

let personalInformationIds = [];

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

let variantIds = [];

for (let i = 1; i < data.products.length; i++) {
  variantIds.push(data.products[i][0]);

  variantsQuery.push([
    i,
    `INSERT INTO variants (id, product_id, title, price, stock, ended_at, is_published, is_active, created_at, updated_at) VALUES ('${data.products[i][0]}', '${productId}', '${data.products[i][3]}', ${data.products[i][7]}, ${data.products[i][8]}, '2025-03-22', false, true, '2025-03-22', '2025-03-22');`,
  ]);
}

for (let i = 1; i < data.user.length; i++) {
  usersQuery.push([
    i,
    `INSERT INTO users (id, role, email, password, refresh_token, created_at, updated_at) VALUES ('${data.user[i][0]}', '${data.user[i][1]}', '${data.user[i][2]}', '${data.user[i][3]}', '${data.user[i][4]}', '2025-03-21', '2025-03-21');`,
  ]);
}

for (let i = 1; i < data.parqQuestion.length; i++) {
  parqQuestionsQuery.push([
    i,
    `INSERT INTO parq_questions (id, user_id, question_1, question_2, question_3, question_4, question_5, question_6, question_7, created_at, updated_at) VALUES ('${data.parqQuestion[i][0]}', '${data.parqQuestion[i][1]}', ${data.parqQuestion[i][2]}, ${data.parqQuestion[i][3]}, ${data.parqQuestion[i][4]}, ${data.parqQuestion[i][5]}, ${data.parqQuestion[i][6]}, ${data.parqQuestion[i][7]}, ${data.parqQuestion[i][8]}, '2025-03-20', '2025-03-20');`,
  ]);
}

for (let i = 1; i < data.personalInformation.length; i++) {
  let isDuplicated = false;

  for (let j = 0; j < personalInformationIds.length; j++) {
    if (data.personalInformation[i][1] == personalInformationIds[j]) {
      isDuplicated = true;
    }
  }

  if (!isDuplicated) {
    personalInformationsQuery.push([
      i,
      `INSERT INTO personal_infomations (id, user_id, first_name, last_name, contact, gender, nationality, ktp, health_problem, community, name_of_emergency_contact, relation_of_emergency_contact, emergency_contact, shirt_type, shirt_size, blood_type, created_at, updated_at) VALUES ('${data.personalInformation[i][0]}', '${data.personalInformation[i][1]}', '${data.personalInformation[i][2]}', '${data.personalInformation[i][3]}', '${data.personalInformation[i][4]}', '${data.personalInformation[i][5]}', '${data.personalInformation[i][6]}', '${data.personalInformation[i][7]}', '${data.personalInformation[i][8]}', '${data.personalInformation[i][11]}', '${data.personalInformation[i][12]}', '${data.personalInformation[i][13]}', '${data.personalInformation[i][14]}', '${data.personalInformation[i][15]}', '${data.personalInformation[i][16]}', '${data.personalInformation[i][9]}', '2025-03-20', '2025-03-20');`,
    ]);
    personalInformationIds.push(data.personalInformation[i][0]);
  }
}

let unValid = [];

let usedOrderId = [];
for (let i = 1; i < data.userPayment.length; i++) {
  let isValid = false;

  if (data.userPayment[i][1] && data.userPayment[i][4] == true) {
    isValid = true;
    userPaymentQuery.push([
      i,
      `INSERT INTO user_payments (id, order_id, variant_id, user_id, transaction_status, is_payed, is_qr_booked, gross_amount, payment_type, created_at, updated_at, bib_number) VALUES('${
        data.userPayment[i][0]
      }', ${data.userPayment[i][1] ? `'${data.userPayment[i][1]}'` : null}, '${
        data.userPayment[i][2]
      }', '${data.userPayment[i][3]}', '${"settlement"}',${
        data.userPayment[i][4]
      }, ${data.userPayment[i][5]}, ${
        data.userPayment[i][6] ? data.userPayment[i][6] : null
      }, ${
        data.userPayment[i][7] ? `'${data.userPayment[i][7]}'` : null
      }, '2025-03-21', '2025-03-21', ${
        data.userPayment[i][8]
          ? `'${String(data.userPayment[i][8]).padStart(4, "0")}'`
          : null
      });`,
    ]);
  } else {
    const userId = data.userPayment[i][3];

    for (let j = 1; j < data.user.length; j++) {
      let isStop = false;

      if (userId == data.user[j][0]) {
        for (let p = 1; p < data.midtrans.length; p++) {
          if (
            data.midtrans[p][8] == data.user[j][2] &&
            data.midtrans[p][5] != "settlement" &&
            data.midtrans[p][3] == "Payment"
          ) {
            isValid = true;
            let isSame = false;

            for (let k = 0; k < usedOrderId.length; k++) {
              if (data.midtrans[p][1] == usedOrderId[k]) {
                isSame = true;
              }
            }

            if (!isSame) {
              userPaymentQuery.push([
                i,
                `INSERT INTO user_payments (id, order_id, variant_id, user_id, transaction_status, is_payed, is_qr_booked, gross_amount, payment_type, created_at, updated_at, bib_number) VALUES('${data.userPayment[i][0]}', '${data.midtrans[p][1]}', '${data.userPayment[i][2]}', '${data.userPayment[i][3]}', '${data.midtrans[p][5]}',${data.userPayment[i][4]}, ${data.userPayment[i][5]}, ${data.midtrans[p][4]},'${data.midtrans[p][3]}', '2025-03-21', '2025-03-21', null);`,
              ]);

              usedOrderId.push(data.midtrans[p][1]);
              isStop = true;
              break;
            }
          }
        }
      }

      if (isStop) {
        break;
      }
    }
  }

  if (!isValid) {
    unValid.push(data.userPayment[i][3]);
  }
}

// let query = []

// for(let i = 0;i < unValid.length;i++){
//   for(let j = 1;j < data.user.length;j++){
//     if(unValid[i] == data.user[j][0]){

//       for(let p = 1;p < data.midtrans.length;p++){
//         if(data.midtrans[p][8] == data.user[j][2]){
//           query.push([i+1,
// `INSERT INTO transactions (id, event_id, created_at, updated_at) VALUES ('${data.midtrans[p][1]}', '3d3b8134-9d02-4180-ab51-d6cd236df1e2','2025-03-21', '2025-03-21');`])

//       query.push([i+1,
// `UPDATE user_payments SET transaction_id = '${data.midtrans[p][1]}', is_payed = true, is_qr_booked = false, gross_amount = ${data.midtrans[p][4]}, payment_type = '${data.midtrans[p][2]}', bib_number = '0218' where id = 'cebfd198-5de8-4bf3-913b-4ce09853c53c';`])
//         }
//       }

//       // break
//     }
//   }
// }

// console.log("Query : ", personalInformationsQuery[0]);

const queries = async () => {
  let eventLogs = [];
  for (let i = 0; i < eventQuery.length; i++) {
    try {
      await client.query(eventQuery[i][1]);
      // console.log("Event Log : ", i);
      eventLogs.push([i, "success"]);
    } catch (error) {
      eventLogs.push([i, "failed"]);
    }
  }

  let productCategoryLogs = [];
  for (let i = 0; i < productCategoriesQuery.length; i++) {
    try {
      await client.query(productCategoriesQuery[i][1]);
      // console.log("Product Category Log : ", i);
      productCategoryLogs.push([i, "success"]);
    } catch (error) {
      productCategoryLogs.push([i, "failed"]);
    }
  }

  let productLogs = [];
  for (let i = 0; i < productsQuery.length; i++) {
    try {
      await client.query(productsQuery[i][1]);
      // console.log("Product Log : ", i);
      productLogs.push([i, "success"]);
    } catch (error) {
      productLogs.push([i, "failed"]);
    }
  }

  let variantLogs = [];
  for (let i = 0; i < variantsQuery.length; i++) {
    try {
      await client.query(variantsQuery[i][1]);
      // console.log("Variant Log : ", i);
      variantLogs.push([i, "success"]);
    } catch (error) {
      variantLogs.push([i, "failed"]);
    }
  }

  let userLogs = [];
  for (let i = 0; i < usersQuery.length; i++) {
    try {
      await client.query(usersQuery[i][1]);
      // console.log("User Log : ", i);
      userLogs.push([i, "success"]);
    } catch (error) {
      userLogs.push([i, "failed"]);
    }
  }

  let parqQuestionLogs = [];
  for (let i = 0; i < parqQuestionsQuery.length; i++) {
    try {
      await client.query(parqQuestionsQuery[i][1]);
      // console.log("Parq Question Log : ", i);
      parqQuestionLogs.push([i, "success"]);
    } catch (error) {
      parqQuestionLogs.push([i, "failed"]);
    }
  }

  let personalInformationLogs = [];
  for (let i = 0; i < personalInformationsQuery.length; i++) {
    try {
      await client.query(personalInformationsQuery[i][1]);
      console.log("Personal Information Log : ", i);
      personalInformationLogs.push([i, "success"]);
    } catch (error) {
      personalInformationLogs.push([i, "failed"]);
    }
  }

  let userPaymentLogs = [];
  for (let i = 0; i < userPaymentQuery.length; i++) {
    try {
      await client.query(userPaymentQuery[i][1]);
      // console.log("User Payment Log : ", i);
      userPaymentLogs.push([i, "success"]);
    } catch (error) {
      userPaymentLogs.push([i, "failed"]);
    }
  }
};

console.log("Personal Info Length : ", personalInformationsQuery.length)

// queries()

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
