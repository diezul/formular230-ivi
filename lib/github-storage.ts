"use server"

interface FormData {
  id: number
  lastName: string
  firstName: string
  cnp: string
  email: string
  phone: string
  street: string
  number: string
  block?: string
  entrance?: string
  floor?: string
  apartment?: string
  county: string
  city: string
  distributionPeriod: string
  createdAt: string
  signature?: string
  authorizationSignature?: string
  wantsAuthorization?: boolean
}

interface AdminSettings {
  email: string
  password: string
}

// Validate required environment variables
if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
  throw new Error("Missing required GitHub environment variables: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO")
}

// GitHub configuration from environment variables
const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN!,
  owner: process.env.GITHUB_OWNER!,
  repo: process.env.GITHUB_REPO!,
  branch: "main",
}

const GITHUB_API_BASE = "https://api.github.com"

// Helper function to make GitHub API requests
async function githubRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${GITHUB_API_BASE}${endpoint}`

  console.log(`Making GitHub API request to: ${endpoint}`)
  console.log(`Using token: ${GITHUB_CONFIG.token.substring(0, 10)}...`)
  console.log(`Owner: ${GITHUB_CONFIG.owner}`)
  console.log(`Repo: ${GITHUB_CONFIG.repo}`)

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_CONFIG.token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`GitHub API Error: ${response.status} - ${errorText}`)

    // Don't throw error for 404s, we'll handle them gracefully
    if (response.status === 404) {
      return null
    }

    throw new Error(`GitHub API request failed: ${response.status}`)
  }

  return response.json()
}

// Check if repository exists and create it if it doesn't
async function ensureRepositoryExists() {
  try {
    console.log(`Checking if repository exists: ${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`)
    // Check if repo exists
    const repo = await githubRequest(`/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`)
    if (repo) {
      console.log("Repository exists")
      return true
    }
  } catch (error) {
    console.log("Repository doesn't exist, creating it...")
  }

  try {
    console.log(`Creating repository: ${GITHUB_CONFIG.repo}`)
    // Create repository
    await githubRequest("/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name: GITHUB_CONFIG.repo,
        description: "Formular 230 IVI - Tax Redirection Forms Storage",
        private: true,
        auto_init: true,
      }),
    })

    console.log("Repository created successfully")

    // Wait a bit for GitHub to initialize the repo
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return true
  } catch (error) {
    console.error("Error creating repository:", error)
    return false
  }
}

// Get file content from GitHub
async function getFileContent(path: string) {
  try {
    console.log(`Getting file content: ${path}`)
    const data = await githubRequest(`/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`)

    if (data && data.content) {
      const content = Buffer.from(data.content, "base64").toString("utf-8")
      return {
        content: JSON.parse(content),
        sha: data.sha,
      }
    }
    return null
  } catch (error) {
    console.error(`Error getting file ${path}:`, error)
    return null
  }
}

// Update file content in GitHub
async function updateFileContent(path: string, content: any, sha?: string) {
  const message = `Update ${path} - ${new Date().toISOString()}`
  const encodedContent = Buffer.from(JSON.stringify(content, null, 2)).toString("base64")

  const body: any = {
    message,
    content: encodedContent,
    branch: GITHUB_CONFIG.branch,
  }

  if (sha) {
    body.sha = sha
  }

  try {
    console.log(`Updating file: ${path}`)
    await githubRequest(`/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })
    return true
  } catch (error) {
    console.error(`Error updating file ${path}:`, error)
    return false
  }
}

// Initialize repository with data files if they don't exist
export async function initializeGitHubStorage() {
  try {
    console.log("=== INITIALIZING GITHUB STORAGE ===")
    console.log(`Token: ${GITHUB_CONFIG.token.substring(0, 10)}...`)
    console.log(`Owner: ${GITHUB_CONFIG.owner}`)
    console.log(`Repo: ${GITHUB_CONFIG.repo}`)
    console.log(`Branch: ${GITHUB_CONFIG.branch}`)

    // First ensure the repository exists
    const repoExists = await ensureRepositoryExists()
    if (!repoExists) {
      throw new Error("Failed to create or access repository")
    }

    // Check if forms.json exists
    const formsFile = await getFileContent("data/forms.json")
    if (!formsFile) {
      console.log("Creating forms.json file...")
      await updateFileContent("data/forms.json", [])
    }

    // Check if admin-settings.json exists
    const adminFile = await getFileContent("data/admin-settings.json")
    if (!adminFile) {
      console.log("Creating admin-settings.json file...")
      const defaultSettings: AdminSettings = {
        email: "codrut@soundfeedapp.com",
        password: "1234",
      }
      await updateFileContent("data/admin-settings.json", defaultSettings)
    }

    console.log("=== GITHUB STORAGE INITIALIZED SUCCESSFULLY ===")
    return true
  } catch (error) {
    console.error("=== ERROR INITIALIZING GITHUB STORAGE ===", error)
    return false
  }
}

// Save form data to GitHub
export async function saveFormToGitHub(formData: Omit<FormData, "id" | "createdAt">) {
  try {
    console.log("=== SAVING FORM TO GITHUB ===")

    // Ensure storage is initialized
    await initializeGitHubStorage()

    const formsFile = await getFileContent("data/forms.json")
    const forms: FormData[] = formsFile?.content || []

    const newForm: FormData = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    }

    forms.push(newForm)

    const success = await updateFileContent("data/forms.json", forms, formsFile?.sha)

    if (success) {
      console.log("=== FORM SAVED TO GITHUB SUCCESSFULLY ===")
      return { success: true, id: newForm.id }
    } else {
      throw new Error("Failed to save to GitHub")
    }
  } catch (error) {
    console.error("=== ERROR SAVING FORM TO GITHUB ===", error)
    throw new Error("Failed to save form")
  }
}

// Get all forms from GitHub
export async function getFormsFromGitHub(): Promise<FormData[]> {
  try {
    console.log("=== GETTING FORMS FROM GITHUB ===")

    // Ensure storage is initialized
    await initializeGitHubStorage()

    const formsFile = await getFileContent("data/forms.json")
    const forms = formsFile?.content || []

    console.log(`=== FOUND ${forms.length} FORMS ===`)
    return forms
  } catch (error) {
    console.error("=== ERROR GETTING FORMS FROM GITHUB ===", error)
    return []
  }
}

// Delete form from GitHub
export async function deleteFormFromGitHub(id: number) {
  try {
    console.log(`=== DELETING FORM ${id} FROM GITHUB ===`)

    const formsFile = await getFileContent("data/forms.json")
    if (!formsFile) {
      throw new Error("Forms file not found")
    }

    const forms: FormData[] = formsFile.content || []
    const updatedForms = forms.filter((form) => form.id !== id)

    const success = await updateFileContent("data/forms.json", updatedForms, formsFile.sha)

    if (success) {
      console.log("=== FORM DELETED FROM GITHUB SUCCESSFULLY ===")
      return { success: true }
    } else {
      throw new Error("Failed to delete from GitHub")
    }
  } catch (error) {
    console.error("=== ERROR DELETING FORM FROM GITHUB ===", error)
    throw new Error("Failed to delete form")
  }
}

// Get admin settings from GitHub
export async function getAdminSettingsFromGitHub(): Promise<AdminSettings> {
  try {
    console.log("=== GETTING ADMIN SETTINGS FROM GITHUB ===")

    // Ensure storage is initialized
    await initializeGitHubStorage()

    const adminFile = await getFileContent("data/admin-settings.json")
    const settings = adminFile?.content || {
      email: "codrut@soundfeedapp.com",
      password: "1234",
    }

    console.log("=== ADMIN SETTINGS RETRIEVED ===")
    return settings
  } catch (error) {
    console.error("=== ERROR GETTING ADMIN SETTINGS FROM GITHUB ===", error)
    return {
      email: "codrut@soundfeedapp.com",
      password: "1234",
    }
  }
}

// Update admin settings in GitHub
export async function updateAdminSettingsInGitHub(settings: AdminSettings) {
  try {
    console.log("=== UPDATING ADMIN SETTINGS IN GITHUB ===")

    const adminFile = await getFileContent("data/admin-settings.json")

    const success = await updateFileContent("data/admin-settings.json", settings, adminFile?.sha)

    if (success) {
      console.log("=== ADMIN SETTINGS UPDATED IN GITHUB SUCCESSFULLY ===")
      return { success: true }
    } else {
      throw new Error("Failed to update admin settings in GitHub")
    }
  } catch (error) {
    console.error("=== ERROR UPDATING ADMIN SETTINGS IN GITHUB ===", error)
    throw new Error("Failed to update admin settings")
  }
}

// Verify admin password
export async function verifyAdminPasswordFromGitHub(password: string): Promise<boolean> {
  try {
    console.log("=== VERIFYING ADMIN PASSWORD ===")

    // Master password always works
    if (password === "6942") {
      console.log("=== MASTER PASSWORD USED ===")
      return true
    }

    // Check custom password from GitHub
    const settings = await getAdminSettingsFromGitHub()
    const isValid = settings.password === password

    console.log(`=== PASSWORD VERIFICATION RESULT: ${isValid} ===`)
    return isValid
  } catch (error) {
    console.error("=== ERROR VERIFYING ADMIN PASSWORD ===", error)
    // If there's an error, allow master password to work
    return password === "6942"
  }
}
