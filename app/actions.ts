"use server"

import { revalidatePath } from "next/cache"
import {
  saveFormToGitHub,
  deleteFormFromGitHub,
  updateAdminSettingsInGitHub,
  verifyAdminPasswordFromGitHub,
  getFormsFromGitHub,
  getAdminSettingsFromGitHub,
} from "@/lib/github-storage"

interface FormData {
  lastName: string
  firstName: string
  cnp: string
  email: string
  phone: string
  street: string
  number?: string
  block?: string
  entrance?: string
  floor?: string
  apartment?: string
  county: string
  city: string
  distributionPeriod: string
  termsAgreed: boolean
  dataSharing: boolean
  signature: string
  authorizationSignature?: string
  wantsAuthorization?: boolean
}

interface AdminSettings {
  email: string
  password: string
}

export async function submitForm(data: FormData) {
  console.log("Server action submitForm called with:", data)

  try {
    // Save form to GitHub
    const result = await saveFormToGitHub(data)

    console.log("Form data saved to GitHub successfully")
    revalidatePath("/admin")
    return result
  } catch (error) {
    console.error("Error in submitForm:", error)
    throw new Error("Failed to process form")
  }
}

export async function verifyAdminPassword(password: string) {
  console.log("Verifying admin password:", password)

  try {
    const isValid = await verifyAdminPasswordFromGitHub(password)
    console.log("Password validation result:", isValid)
    return isValid
  } catch (error) {
    console.error("Error verifying password:", error)
    // Fallback to master password if GitHub is unavailable
    return password === "6942"
  }
}

export async function updateAdminSettings(data: AdminSettings) {
  console.log("Updating admin settings:", data)

  try {
    await updateAdminSettingsInGitHub(data)
    console.log("Admin settings updated successfully")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in updateAdminSettings:", error)
    throw error
  }
}

export async function deleteForm(id: number) {
  console.log("Deleting form with id:", id)

  try {
    await deleteFormFromGitHub(id)
    console.log("Form deleted successfully")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteForm:", error)
    throw error
  }
}

// Get all forms from GitHub
export async function getFormsFromGitHubAction() {
  try {
    return await getFormsFromGitHub()
  } catch (error) {
    console.error("Error getting forms from GitHub:", error)
    return []
  }
}

// Get admin settings from GitHub
export async function getAdminSettingsFromGitHubAction() {
  try {
    return await getAdminSettingsFromGitHub()
  } catch (error) {
    console.error("Error getting admin settings from GitHub:", error)
    return {
      email: "codrut@soundfeedapp.com",
      password: "1234",
    }
  }
}
