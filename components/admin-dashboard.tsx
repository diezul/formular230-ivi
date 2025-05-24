"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { downloadFormPDF, downloadBulkPDF } from "@/lib/pdf-generator"
import { Download, FileDown, Trash2, RefreshCw } from "lucide-react"
import {
  deleteForm,
  updateAdminSettings,
  getFormsFromGitHubAction,
  getAdminSettingsFromGitHubAction,
} from "@/app/actions"

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

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [forms, setForms] = useState<FormData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [adminSettings, setAdminSettings] = useState({
    email: "codrut@soundfeedapp.com",
    password: "1234",
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  useEffect(() => {
    loadForms()
    loadAdminSettings()
  }, [])

  const loadForms = async () => {
    setIsLoading(true)
    try {
      const formsData = await getFormsFromGitHubAction()
      setForms(formsData)
      console.log("Loaded forms from GitHub:", formsData)
    } catch (error) {
      console.error("Error loading forms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAdminSettings = async () => {
    try {
      const settings = await getAdminSettingsFromGitHubAction()
      setAdminSettings(settings)
    } catch (error) {
      console.error("Error loading admin settings:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated")
    onLogout()
  }

  const handleDelete = async (id: number) => {
    if (confirm("Sigur doriți să ștergeți acest formular?")) {
      try {
        await deleteForm(id)
        await loadForms() // Reload forms after deletion
      } catch (error) {
        console.error("Error deleting form:", error)
        alert("A apărut o eroare la ștergerea formularului.")
      }
    }
  }

  const downloadAsJSON = (form: FormData) => {
    const dataStr = JSON.stringify(form, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `formular_${form.lastName}_${form.firstName}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPDF = (form: FormData) => {
    try {
      downloadFormPDF(form)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("A apărut o eroare la generarea PDF-ului.")
    }
  }

  const handleBulkDownload = () => {
    if (filteredForms.length === 0) {
      alert("Nu există formulare pentru descărcare.")
      return
    }

    if (confirm(`Sigur doriți să descărcați toate ${filteredForms.length} formularele în format PDF?`)) {
      try {
        downloadBulkPDF(filteredForms)
      } catch (error) {
        console.error("Error generating bulk PDF:", error)
        alert("A apărut o eroare la generarea PDF-ului bulk.")
      }
    }
  }

  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    try {
      await updateAdminSettings(adminSettings)
      alert("Setările au fost salvate cu succes!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("A apărut o eroare la salvarea setărilor.")
    } finally {
      setIsSavingSettings(false)
    }
  }

  const filteredForms = forms.filter(
    (form) =>
      form.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.cnp.includes(searchTerm),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Se încarcă datele din GitHub...</p>
            <p className="text-sm text-gray-500 mt-2">Dacă este prima utilizare, se creează repository-ul automat</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-purple-800">Admin Dashboard - Project IVI</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadForms}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reîncarcă
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Deconectare
          </Button>
        </div>
      </header>

      {/* Admin Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-purple-800">Setări Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email pentru notificări</label>
              <Input
                value={adminSettings.email}
                onChange={(e) => setAdminSettings((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email pentru notificări"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Parolă nouă (autentificare admin)</label>
              <Input
                type="password"
                value={adminSettings.password}
                onChange={(e) => setAdminSettings((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Introduceți parola nouă"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleSaveSettings}
              className="bg-purple-700 hover:bg-purple-800"
              disabled={isSavingSettings}
            >
              {isSavingSettings ? "Se salvează..." : "Salvează setările"}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Parola master "6942" va funcționa mereu. După salvare, parola "1234" nu va mai funcționa.
          </p>
        </CardContent>
      </Card>

      {/* Forms List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-purple-800">Formulare trimise ({forms.length})</CardTitle>
            {filteredForms.length > 0 && (
              <Button onClick={handleBulkDownload} className="bg-purple-700 hover:bg-purple-800">
                <Download className="w-4 h-4 mr-2" />
                Descarcă toate PDF ({filteredForms.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Caută după nume, email sau CNP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredForms.length === 0 ? (
            <div className="p-8 text-center">
              {searchTerm ? "Nu s-au găsit rezultate pentru căutarea dvs." : "Nu există formulare trimise încă."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>CNP</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Perioada</TableHead>
                  <TableHead>Împuternicire</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">
                      {form.lastName} {form.firstName}
                    </TableCell>
                    <TableCell>{form.cnp}</TableCell>
                    <TableCell>{form.email}</TableCell>
                    <TableCell>{form.phone}</TableCell>
                    <TableCell>
                      {form.distributionPeriod} {form.distributionPeriod === "1" ? "an" : "ani"}
                    </TableCell>
                    <TableCell>
                      {form.wantsAuthorization ? (
                        <span className="text-green-600 font-medium">Da</span>
                      ) : (
                        <span className="text-gray-500">Nu</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(form.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(form)}>
                          <FileDown className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadAsJSON(form)}>
                          <Download className="w-4 h-4 mr-1" />
                          JSON
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(form.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
