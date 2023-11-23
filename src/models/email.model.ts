import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  email: { type: String, required: true },
});

const EmailModel = mongoose.models.emails || mongoose.model("emails", emailSchema);

export default EmailModel;
