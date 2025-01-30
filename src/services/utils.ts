import mongoose from "mongoose";

export async function transaction(cb: () => Promise<void>) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await cb();
        session.commitTransaction();
    } catch (err) {
        session.abortTransaction();
        throw err;
    } finally {
        await session.endSession();
    }
}