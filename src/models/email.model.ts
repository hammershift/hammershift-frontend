import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
  },
  {
    collection: "emails",
  }
);

const EmailModel =
  mongoose.models.Email || mongoose.model("Email", emailSchema);

export default EmailModel;
