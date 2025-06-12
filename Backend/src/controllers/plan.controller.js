import Plan from "../models/plan.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new plan
export const createPlan = async (req, res, next) => {
  try {
    const { title, type } = req.body;

    if (!title || !type) {
      return next(new ApiError(400, "Title and type are required"));
    }

    const newPlan = new Plan({ title, type });
    await newPlan.save();

    return res
      .status(201)
      .json(new ApiResponse(201, newPlan, "Plan created successfully"));
  } catch (error) {
    return next(new ApiError(500, "Error creating plan", error));
  }
};

// Get all plans (optional filter by type)
export const getPlans = async (req, res, next) => {
  try {
    const { type } = req.query;

    const plans = await Plan.find(type ? { type } : {});

    return res
      .status(200)
      .json(new ApiResponse(200, plans, "Plans fetched successfully"));
  } catch (error) {
    return next(new ApiError(500, "Error fetching plans", error));
  }
};

// Delete a plan
export const deletePlan = async (req, res, next) => {
  try {
    const deleted = await Plan.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return next(new ApiError(404, "Plan not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deleted, "Plan deleted successfully"));
  } catch (error) {
    return next(new ApiError(500, "Error deleting plan", error));
  }
};

// Update a plan
export const updatePlan = async (req, res, next) => {
  try {
    const updated = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return next(new ApiError(404, "Plan not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Plan updated successfully"));
  } catch (error) {
    return next(new ApiError(500, "Error updating plan", error));
  }
};
