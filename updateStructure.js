import xlsx from "xlsx";
import { v4 as uuidv4 } from "uuid";
import { Client } from "pg";
import dataEvents from "./data/events.json" assert {type: 'json'};
import dataParQuestions from "./data/parq_questions.json" assert {type: 'json'};
import dataUserPayments from "./data/user_payments.json" assert {type: 'json'}
import dataUsers from "./data/users.json" assert {type: 'json'}
import dataProductCategories from "./data/product_categories.json" assert {type: 'json'}
import dataProducts from "./data/products.json" assert {type: 'json'}
import dataPersonalInformations from "./data/personal_infomations.json" assert {type: 'json'}

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "soekarnorun_sample",
  password: "",
  port: 5432,
});

await client.connect();

const workBook = {
  midtrans: xlsx.readFile("transaction-report.xls"),
};

const workSheet = {
  midtrans: workBook.midtrans.Sheets["transaction-report"],
};

const data = {
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

for (let i = 0; i < dataEvents.length; i++) {
  const event = dataEvents[i]

  eventQuery.push([
    1,
    `INSERT INTO events (id, title, location, address, started_at, ended_at, finished_at, is_active) VALUES ('${event.id}', '${event.title}', '${event.location}', '${event.address}', '${event.started_at}', '${event.ended_at}', '20205-06-08', false);`
  ])
}

for (let i = 0; i < dataProductCategories.length; i++) {
  const productCategory = dataProductCategories[i]

  productCategoriesQuery.push([
    1,
    `INSERT INTO product_categories (id, event_id, title, created_at, updated_at) VALUES ('${productCategory.id}', '${productCategory.event_id}', '${productCategory.title}', '${productCategory.created_at}', '${productCategory.updated_at}');`,
  ]);
}


let productId = uuidv4();
productsQuery.push([
  1,
  `INSERT INTO products (id, product_category_id, title, created_at, updated_at) VALUES ('${productId}', '18c12bb0-30cb-44e7-bc0f-eb1ce62856fe', '5K', '2025-06-08', '2025-06-08');`,
]);

let variantIds = [];

for (let i = 0; i < dataProducts.length; i++) {
  const product = dataProducts[i]
  variantIds.push(product.id);

  variantsQuery.push([
    i,
    `INSERT INTO variants (id, product_id, title, price, stock, is_published, is_active, created_at, updated_at) VALUES ('${product.id}', '${productId}', '${product.title}', ${product.price}, ${product.stock}, false, true, '2025-03-22', '2025-03-22');`,
  ]);
}

for (let i = 0; i < dataUsers.length; i++) {
  const user = dataUsers[i]

  usersQuery.push([
    i,
    `INSERT INTO users (id, role, email, password, refresh_token, created_at, updated_at) VALUES ('${user.id}', '${user.role}', '${user.email}', '${user.password}', ${user.refresh_token ? `'${user.refresh_token}'` : null}, '${user.created_at}', '${user.updated_at}');`,
  ]);
}

for (let i = 0; i < dataParQuestions.length; i++) {
  const parQuestion = dataParQuestions[i]

  parqQuestionsQuery.push([
    i,
    `INSERT INTO parq_questions (id, user_id, question_1, question_2, question_3, question_4, question_5, question_6, question_7, created_at, updated_at) VALUES ('${parQuestion.id}', '${parQuestion.user_id}', ${parQuestion.question_1}, ${parQuestion.question_2}, ${parQuestion.question_3}, ${parQuestion.question_4}, ${parQuestion.question_5}, ${parQuestion.question_6}, ${parQuestion.question_7}, '${parQuestion.created_at}', '${parQuestion.updated_at}');`,
  ]);
}

for (let i = 0; i < dataPersonalInformations.length; i++) {
  const personalInformation = dataPersonalInformations[i]
  let isDuplicated = false;

  for (let j = 0; j < personalInformationIds.length; j++) {
    if (personalInformation.user_id == personalInformationIds[j]) {
      isDuplicated = true;
    }
  }

  if (!isDuplicated) {
    personalInformationsQuery.push([
      i,
      `INSERT INTO personal_informations (id, user_id, first_name, last_name, 
      contact, gender, nationality, ktp, health_problem, community, name_of_emergency_contact, 
      relation_of_emergency_contact, emergency_contact, shirt_type, shirt_size, 
      blood_type, created_at, updated_at) 
      VALUES ('${personalInformation.id}', '${personalInformation.user_id}', ${personalInformation.first_name ? `'${personalInformation.first_name}'` : null}, '${personalInformation.last_name}', '${personalInformation.contact}', '${personalInformation.gender}', '${personalInformation.nationality}', '${personalInformation.ktp}', '${personalInformation.health_problem}', ${personalInformation.community ? `'${personalInformation.community}'` : null}, '${personalInformation.name_of_emergency_contact}', '${personalInformation.relation_of_emergency_contact}', '${personalInformation.emergencyContact}', '${personalInformation.shirt_type}', '${personalInformation.shirt_size}', '${personalInformation.blood_type}', '${personalInformation.created_at}', '${personalInformation.updated_at}');`,
    ]);
    personalInformationIds.push(personalInformation.id);
  }
}

let unValid = [];

let usedOrderId = [];
for (let i = 0; i < dataUserPayments.length; i++) {
  const userPayment = dataUserPayments[i]
  let isValid = false;

  if (userPayment.transaction_id && userPayment.is_payed == true) {
    isValid = true;
    userPaymentQuery.push([
      i,
      `INSERT INTO user_payments (id, order_id, variant_id, user_id, transaction_status, is_payed, is_qr_booked, gross_amount, payment_type, created_at, updated_at, bib_number) VALUES('${userPayment.id
      }', ${userPayment.transaction_id ? `'${userPayment.transaction_id}'` : null}, '${userPayment.product_id
      }', '${userPayment.user_id}', '${"settlement"}',${userPayment.is_payed
      }, ${userPayment.is_qr_booked}, ${userPayment.gross_amount ? userPayment.gross_amount : null
      }, ${userPayment.payment_type ? `'${userPayment.payment_type}'` : null
      }, '2025-03-21', '2025-03-21', ${userPayment.bib_number
        ? `'${String(userPayment.bib_number).padStart(4, "0")}'`
        : null
      });`,
    ]);
  } else {
    const userId = userPayment.user_id;

    for (let j = 0; j < dataUsers.length; j++) {
      const user = dataUsers[j]
      let isStop = false;

      if (userId == user.id) {
        for (let p = 1; p < data.midtrans.length; p++) {
          if (
            data.midtrans[p][8] == user.email &&
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
                `INSERT INTO user_payments (id, order_id, variant_id, user_id, transaction_status, is_payed, is_qr_booked, gross_amount, payment_type, created_at, updated_at, bib_number) VALUES('${userPayment.id}', '${data.midtrans[p][1]}', '${userPayment.product_id}', '${userPayment.user_id}', '${data.midtrans[p][5]}',${userPayment.is_payed}, ${userPayment.is_qr_booked}, ${data.midtrans[p][4]},'${data.midtrans[p][3]}', '${userPayment.created_at}', '${userPayment.updated_at}', null);`,
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
    unValid.push(userPayment.user_id);
  }
}

const queries = async () => {
  let eventLogs = [];
  for (let i = 0; i < eventQuery.length; i++) {
    try {
      const res = await client.query(eventQuery[i][1]);
      if (res.rowCount == 0) {
        eventLogs.push([i, "failed"]);
      } else {
        eventLogs.push([i, "success"]);
      }

    } catch (error) {
      console.log("Error at Event index:", i, "\nQuery:\n", eventQuery[i][1], "\nError:\n", error.message);
      eventLogs.push([i, "failed"]);
    }
  }

  let productCategoryLogs = [];
  for (let i = 0; i < productCategoriesQuery.length; i++) {
    try {
      const res = await client.query(productCategoriesQuery[i][1]);
      if (res.rowCount == 0) {
        productCategoryLogs.push([i, "failed"]);
      } else {
        productCategoryLogs.push([i, "success"]);
      }

    } catch (error) {
      console.log("Error at personalInformationsQuery index:", i, "\nQuery:\n", productCategoryLogs[i][1], "\nError:\n", error.message);
      productCategoryLogs.push([i, "failed"]);
    }
  }

  let productLogs = [];
  for (let i = 0; i < productsQuery.length; i++) {
    try {
      const res = await client.query(productsQuery[i][1]);

     if (res.rowCount == 0) {
        productLogs.push([i, "failed"]);
      } else {
        productLogs.push([i, "success"]);
      }

    } catch (error) {
      console.log("Error at Product Query index:", i, "\nQuery:\n", productsQuery[i][1], "\nError:\n", error.message);
      productLogs.push([i, "failed"]);
    }
  }

  let variantLogs = [];
  for (let i = 0; i < variantsQuery.length; i++) {
    try {
      const res = await client.query(variantsQuery[i][1]);
      if (res.rowCount == 0) {
        variantLogs.push([i, "failed"]);
      } else {
        variantLogs.push([i, "success"]);
      }

    } catch (error) {
      console.log("Error at Variant index:", i, "\nQuery:\n", variantsQuery[i][1], "\nError:\n", error.message);
      variantLogs.push([i, "failed"]);
    }
  }

  let userLogs = [];
  for (let i = 0; i < usersQuery.length; i++) {
    try {
      const res = await client.query(usersQuery[i][1]);
      if (res.rowCount == 0) {
        userLogs.push([i, "failed"]);
      } else {
        userLogs.push([i, "success"]);
      }

    } catch (error) {
      console.log("Error at Users Query index:", i, "\nQuery:\n", usersQuery[i][1], "\nError:\n", error.message);
      userLogs.push([i, "failed"]);
    }
  }

  let parqQuestionLogs = [];
  for (let i = 0; i < parqQuestionsQuery.length; i++) {
    try {
      const res = await client.query(parqQuestionsQuery[i][1]);
      if (res.rowCount == 0) {
        parqQuestionLogs.push([i, "failed"]);
      } else {
        parqQuestionLogs.push([i, "success"]);
      }

    } catch (error) {
      console.log("Error at parqquestion index:", i, "\nQuery:\n", parqQuestionsQuery[i][1], "\nError:\n", error.message);
      parqQuestionLogs.push([i, "failed"]);
    }
  }

  let personalInformationLogs = [];
  for (let i = 0; i < personalInformationsQuery.length; i++) {
    try {
      const res = await client.query(personalInformationsQuery[i][1]);
      console.log("Personal Information Log : ", i);

      if (res.rowCount == 0) {
        personalInformationLogs.push([i, "failed"]);
      } else {
        personalInformationLogs.push([i, "success"]);
      }

    } catch (error) {
      console.log("Error at personalInformationsQuery index:", i, "\nQuery:\n", personalInformationsQuery[i][1], "\nError:\n", error.message);
      personalInformationLogs.push([i, "failed"]);
    }

  }

  let userPaymentLogs = [];
  for (let i = 0; i < userPaymentQuery.length; i++) {
    try {
      const res = await client.query(userPaymentQuery[i][1]);
      if (res.rowCount == 0) {
        userPaymentLogs.push([i, "failed"]);
      } else {
        userPaymentLogs.push([i, "success"]);
      }

    } catch (error) {
      console.log("Error at userpaymentsQuery index:", i, "\nQuery:\n", userPaymentQuery[i][1], "\nError:\n", error.message);
      userPaymentLogs.push([i, "failed"]);
    }
  }

  let eventSuccess = 0
  for(let i = 0;i < eventLogs.length;i++){
    if(eventLogs[i][1] == "success"){
      eventSuccess++
    }
  }

  let productCategorySuccess = 0
  for(let i = 0;i < productCategoryLogs.length;i++){
    if(productCategoryLogs[i][1] == "success"){
      productCategorySuccess++
    }
  }

  let parqQuestionSuccess = 0
  for(let i = 0;i < parqQuestionLogs.length;i++){
    if(parqQuestionLogs[i][1] == "success"){
      parqQuestionSuccess++
    }
  }

  let personalInformationSuccess = 0
  for(let i = 0;i < personalInformationLogs.length;i++){
    if(personalInformationLogs[i][1] == "success"){
      personalInformationSuccess++
    }
  }

  let userPaymentSuccess = 0
  let userPaymentFailed = []
  for(let i = 0;i < userPaymentLogs.length;i++){
    if(userPaymentLogs[i][1] == "success"){
      userPaymentSuccess++
    }else{
      userPaymentFailed.push(userPaymentLogs[i])
    }
  }

  let variantSuccess = 0
  for(let i = 0;i < variantLogs.length;i++){
    if(variantLogs[i][1] == "success"){
      variantSuccess++
    }
  }

  let userSuccess = 0
  for(let i = 0;i < userLogs.length;i++){
    if(userLogs[i][1] == "success"){
      userSuccess++
    }
  }

  let productSuccess = 0
  for(let i = 0;i < productLogs.length;i++){
    if(productLogs[i][1] == "success"){
      productSuccess++
    }
  }

  console.log("Event Success : ", eventSuccess, " From (", dataEvents.length, ")")
  console.log("ParqQuestion Success : ", parqQuestionSuccess, " From (", dataParQuestions.length, ")")
  console.log("Personal Information Success : ", personalInformationSuccess, " From (", dataPersonalInformations.length, ")")
  console.log("Product Categories Success : ", productCategorySuccess, " From (", dataProductCategories.length, ")")
  console.log("Product Success : ", productSuccess, " From (", dataProducts.length, ")")
  console.log("User Payment Success : ", userPaymentSuccess, " From (", dataUserPayments.length, ")")
  console.log("User Success : ", userSuccess, " From (", dataUsers.length, ")")

  console.log("User Payment Failed Logs : ", userPaymentFailed[0])

};

queries()