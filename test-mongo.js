import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://salahiddinayyubiy9_db_user:xKBs6k2scr5rW3gk@ijtimoiy-tarmoq.yktrrmf.mongodb.net/ijtimoiy_tarmoq?retryWrites=true&w=majority"
)
.then(() => {
  console.log("MongoDB ulandi!");
  process.exit();
})
.catch((err) => {
  console.log("Xato:", err.message);
  process.exit();
});