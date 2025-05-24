import jsPDF from "jspdf"

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

// Function to properly encode Romanian text for PDF
const encodeRomanianText = (text: string): string => {
  return text
    .replace(/ă/g, "a")
    .replace(/Ă/g, "A")
    .replace(/â/g, "a")
    .replace(/Â/g, "A")
    .replace(/î/g, "i")
    .replace(/Î/g, "I")
    .replace(/ș/g, "s")
    .replace(/Ș/g, "S")
    .replace(/ț/g, "t")
    .replace(/Ț/g, "T")
}

// Function to add text with proper spacing
const addTextWithProperSpacing = (doc: jsPDF, text: string, x: number, y: number, options?: any): void => {
  const cleanText = encodeRomanianText(text)
  doc.text(cleanText, x, y, options)
}

// Function to split text properly for Romanian characters
const splitTextToSizeRomanian = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  const cleanText = encodeRomanianText(text)
  return doc.splitTextToSize(cleanText, maxWidth)
}

export const generateFormPDF = (formData: FormData) => {
  const doc = new jsPDF()

  // Set font to ensure consistent spacing
  doc.setFont("helvetica", "normal")

  // Header with logo space and title
  doc.setFillColor(107, 70, 193) // Purple color
  doc.rect(15, 10, 25, 15, "F") // Purple rectangle for logo

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  addTextWithProperSpacing(doc, "Project", 27.5, 16, { align: "center" })
  addTextWithProperSpacing(doc, "IVI", 27.5, 21, { align: "center" })

  // Reset color for main content
  doc.setTextColor(0, 0, 0)

  // Main title
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  addTextWithProperSpacing(doc, "Formular 230", 105, 25, { align: "center" })

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  addTextWithProperSpacing(doc, "Cerere privind destinatia sumei reprezentand pana la 3,5%", 105, 33, {
    align: "center",
  })
  addTextWithProperSpacing(doc, "din impozitul anual datorat", 105, 40, { align: "center" })

  let yPosition = 55

  // Section I - Personal Data
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  addTextWithProperSpacing(doc, "I. DATE DE IDENTIFICARE A CONTRIBUABILULUI", 20, yPosition)
  yPosition += 12

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  const leftMargin = 20
  const fieldWidth = 170
  const lineHeight = 8

  // Name and surname on one line
  addTextWithProperSpacing(doc, `Nume si prenume: ${formData.lastName} ${formData.firstName}`, leftMargin, yPosition)
  yPosition += lineHeight

  addTextWithProperSpacing(doc, `CNP: ${formData.cnp}`, leftMargin, yPosition)
  yPosition += lineHeight

  // Build full address
  let fullAddress = formData.street
  if (formData.number) fullAddress += ` nr. ${formData.number}`
  if (formData.block) fullAddress += `, bl. ${formData.block}`
  if (formData.entrance) fullAddress += `, sc. ${formData.entrance}`
  if (formData.floor) fullAddress += `, et. ${formData.floor}`
  if (formData.apartment) fullAddress += `, ap. ${formData.apartment}`
  if (formData.city) fullAddress += `, ${formData.city}`
  if (formData.county) fullAddress += `, jud. ${formData.county}`

  // Split address if too long
  const addressText = `Adresa: ${fullAddress}`
  const addressLines = splitTextToSizeRomanian(doc, addressText, fieldWidth)
  addressLines.forEach((line: string) => {
    addTextWithProperSpacing(doc, line, leftMargin, yPosition)
    yPosition += lineHeight
  })

  addTextWithProperSpacing(doc, `Telefon: ${formData.phone}`, leftMargin, yPosition)
  yPosition += lineHeight

  addTextWithProperSpacing(doc, `E-mail: ${formData.email}`, leftMargin, yPosition)
  yPosition += 15

  // Section II - Destination
  doc.setFont("helvetica", "bold")
  addTextWithProperSpacing(doc, "II. DESTINATIA SUMEI DE PANA LA 3,5% DIN IMPOZITUL ANUAL", leftMargin, yPosition)
  yPosition += 12

  doc.setFont("helvetica", "normal")

  const destinationText =
    "Solicit redirectionarea sumei reprezentand pana la 3,5% din impozitul anual datorat, conform prevederilor art. 123^1 din Legea nr. 227/2015, catre urmatoarea entitate nonprofit:"
  const destinationLines = splitTextToSizeRomanian(doc, destinationText, fieldWidth)
  destinationLines.forEach((line: string) => {
    addTextWithProperSpacing(doc, line, leftMargin, yPosition)
    yPosition += 6
  })
  yPosition += 8

  addTextWithProperSpacing(
    doc,
    'Denumire entitate nonprofit: Asociatia "Initiativa Valcea Inoveaza"',
    leftMargin,
    yPosition,
  )
  yPosition += lineHeight

  addTextWithProperSpacing(doc, "Cod de identificare fiscala: 44291122", leftMargin, yPosition)
  yPosition += lineHeight

  addTextWithProperSpacing(doc, "Cont bancar (IBAN): RO86BTRLRONCRT0596202401", leftMargin, yPosition)
  yPosition += lineHeight

  addTextWithProperSpacing(
    doc,
    "Adresa: Jud. Valcea, Mun. Ramnicu Valcea, Str. Calea lui Traian nr. 79,",
    leftMargin,
    yPosition,
  )
  yPosition += lineHeight
  addTextWithProperSpacing(doc, "bl. S24, sc. A, et. 4, ap. 19", leftMargin, yPosition)
  yPosition += 15

  // Section III - Signature
  doc.setFont("helvetica", "bold")
  addTextWithProperSpacing(doc, "III. SEMNATURA CONTRIBUABIL", leftMargin, yPosition)
  yPosition += 12

  doc.setFont("helvetica", "normal")

  // Signature area
  addTextWithProperSpacing(doc, "Semnatura:", leftMargin, yPosition)

  // Add signature if available
  if (formData.signature) {
    try {
      doc.addImage(formData.signature, "PNG", leftMargin + 25, yPosition - 5, 50, 15)
    } catch (error) {
      console.error("Error adding signature to PDF:", error)
    }
  }

  // Date on the right side
  const currentDate = new Date().toLocaleDateString("ro-RO")
  addTextWithProperSpacing(doc, `Data: ${currentDate}`, 140, yPosition)
  yPosition += 25

  // Information text
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")

  const infoText1 =
    "Formularul se completeaza de catre contribuabil si poate fi depus personal, prin imputernicit, prin posta sau prin mijloace electronice de transmitere la distanta."
  const infoLines1 = splitTextToSizeRomanian(doc, infoText1, fieldWidth)
  infoLines1.forEach((line: string) => {
    addTextWithProperSpacing(doc, line, leftMargin, yPosition)
    yPosition += 5
  })
  yPosition += 3

  const infoText2 =
    "Redirectionarea celor 3,5% nu reprezinta o donatie si nu implica niciun cost - este vorba de o parte din impozitul deja retinut de stat pentru veniturile din anul trecut."
  const infoLines2 = splitTextToSizeRomanian(doc, infoText2, fieldWidth)
  infoLines2.forEach((line: string) => {
    addTextWithProperSpacing(doc, line, leftMargin, yPosition)
    yPosition += 5
  })

  // Website at bottom right
  doc.setFontSize(8)
  doc.setTextColor(107, 70, 193)
  addTextWithProperSpacing(doc, "www.projectivi.ro", 190, 285, { align: "right" })

  // Authorization section if needed
  if (formData.wantsAuthorization) {
    doc.addPage()

    // Header for second page
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    addTextWithProperSpacing(doc, "IMPUTERNICIRE", 105, 30, { align: "center" })

    yPosition = 50
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const cleanFullAddress = encodeRomanianText(fullAddress)
    const authText = `Subsemnatul/a ${formData.firstName} ${formData.lastName}, identificat/a cu CNP ${formData.cnp}, domiciliat/a in ${cleanFullAddress}, imputernicesc Asociatia "Initiativa Valcea Inoveaza", CIF 44291122, cu sediul in Mun. Ramnicu Valcea, Str. Calea lui Traian nr. 79, bl. S24, sc. A, et. 4, ap. 19, jud. Valcea, reprezentata legal prin Vasile Catalin, sa depuna in numele meu Formularul 230 privind redirectionarea a pana la 3,5% din impozitul pe venitul meu anual datorat catre aceasta entitate nonprofit.`

    const authLines = splitTextToSizeRomanian(doc, authText, fieldWidth)
    authLines.forEach((line: string) => {
      addTextWithProperSpacing(doc, line, leftMargin, yPosition)
      yPosition += 6
    })

    yPosition += 10
    addTextWithProperSpacing(
      doc,
      "Prezenta imputernicire este valabila exclusiv pentru acest scop.",
      leftMargin,
      yPosition,
    )
    yPosition += 20

    // Signature and date for authorization
    addTextWithProperSpacing(doc, "Semnatura:", leftMargin, yPosition)

    if (formData.authorizationSignature) {
      try {
        doc.addImage(formData.authorizationSignature, "PNG", leftMargin + 25, yPosition - 5, 50, 15)
      } catch (error) {
        console.error("Error adding authorization signature to PDF:", error)
      }
    }

    addTextWithProperSpacing(doc, `Data: ${currentDate}`, 140, yPosition)

    // Footer
    yPosition = 270
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    addTextWithProperSpacing(
      doc,
      'Acest document a fost generat automat de platforma Asociatia "Initiativa Valcea Inoveaza"',
      105,
      yPosition,
      { align: "center" },
    )
    addTextWithProperSpacing(doc, "pentru redirectionarea a 3.5% din impozitul pe venit", 105, yPosition + 5, {
      align: "center",
    })
  }

  return doc
}

export const downloadFormPDF = (formData: FormData) => {
  const doc = generateFormPDF(formData)
  doc.save(`Formular_230_${formData.lastName}_${formData.firstName}.pdf`)
}

export const downloadBulkPDF = (forms: FormData[]) => {
  const doc = new jsPDF()
  let isFirstForm = true

  forms.forEach((formData) => {
    if (!isFirstForm) {
      doc.addPage()
    }

    const formDoc = generateFormPDF(formData)
    const pageCount = formDoc.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      if (!isFirstForm || i > 1) {
        doc.addPage()
      }

      // Copy page content from individual form
      const pageData = formDoc.internal.pages[i]
      if (pageData) {
        doc.internal.pages[doc.internal.getCurrentPageInfo().pageNumber] = pageData
      }
    }

    isFirstForm = false
  })

  doc.save(`Formulare_230_Bulk_${new Date().toISOString().split("T")[0]}.pdf`)
}
