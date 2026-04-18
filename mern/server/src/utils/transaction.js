import mongoose from "mongoose";

function isStandaloneTransactionError(error) {
  const message = error?.message || "";
  return (
    message.includes("Transaction numbers are only allowed on a replica set member") ||
    message.includes("Transaction support is not available")
  );
}

export async function runWithOptionalTransaction(work) {
  const dbSession = await mongoose.startSession();

  try {
    let result;
    await dbSession.withTransaction(async () => {
      result = await work(dbSession);
    });
    return result;
  } catch (error) {
    if (isStandaloneTransactionError(error)) {
      return work(null);
    }
    throw error;
  } finally {
    await dbSession.endSession();
  }
}
