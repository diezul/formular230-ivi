"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import SignatureCanvas from "@/components/signature-canvas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { submitForm } from "@/app/actions"

export default function TaxRedirectionForm() {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    cnp: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    block: "",
    entrance: "",
    floor: "",
    apartment: "",
    county: "",
    city: "",
    distributionPeriod: "2", // Changed from "1" to "2"
    termsAgreed: false,
    dataSharing: false,
  })

  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [authorizationSignatureData, setAuthorizationSignatureData] = useState<string | null>(null)
  const [wantsAuthorization, setWantsAuthorization] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.lastName.trim()) newErrors.lastName = "Numele de familie este obligatoriu"
    if (!formData.firstName.trim()) newErrors.firstName = "Prenumele este obligatoriu"
    if (!formData.cnp.trim()) newErrors.cnp = "CNP-ul este obligatoriu"
    if (!formData.email.trim()) newErrors.email = "Email-ul este obligatoriu"
    if (!formData.phone.trim()) newErrors.phone = "Telefonul este obligatoriu"
    if (!formData.street.trim()) newErrors.street = "Strada este obligatorie"
    if (!formData.number.trim()) newErrors.number = "Numărul este obligatoriu"
    if (!formData.county.trim()) newErrors.county = "Județul este obligatoriu"
    if (!formData.city.trim()) newErrors.city = "Localitatea este obligatorie"

    // CNP validation
    if (formData.cnp && formData.cnp.length !== 13) {
      newErrors.cnp = "CNP-ul trebuie să aibă exact 13 cifre"
    }

    // Email validation
    if (formData.email && !formData.email.includes("@")) {
      newErrors.email = "Email-ul nu este valid"
    }

    // Phone validation
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = "Numărul de telefon nu este valid"
    }

    // Terms validation
    if (!formData.termsAgreed) {
      newErrors.termsAgreed = "Trebuie să acceptați termenii și condițiile"
    }
    if (!formData.dataSharing) {
      newErrors.dataSharing = "Trebuie să acceptați partajarea datelor"
    }

    // Signature validation
    if (!signatureData) {
      newErrors.signature = "Semnătura este obligatorie"
    }

    // Authorization signature validation
    if (wantsAuthorization && !authorizationSignatureData) {
      newErrors.authorizationSignature = "Semnătura pentru împuternicire este obligatorie"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Form submission started", formData)

    // Validation
    if (!validateForm()) {
      toast({
        title: "Eroare validare",
        description: "Vă rugăm să completați toate câmpurile obligatorii",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSubmit = {
        ...formData,
        signature: signatureData!,
        authorizationSignature: authorizationSignatureData,
        wantsAuthorization,
      }

      const result = await submitForm(formDataToSubmit)

      if (result.success) {
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: "smooth" })

        // Show prominent success message
        toast({
          title: "✅ Formular trimis cu succes!",
          description:
            "Mulțumim pentru redirecționarea impozitului către Project IVI! Formularul a fost salvat și va fi procesat.",
          duration: 8000,
          className:
            "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-green-50 border-green-200 text-green-800 shadow-2xl max-w-md w-full p-6 rounded-lg",
        })

        // Reset form
        setFormData({
          lastName: "",
          firstName: "",
          cnp: "",
          email: "",
          phone: "",
          street: "",
          number: "",
          block: "",
          entrance: "",
          floor: "",
          apartment: "",
          county: "",
          city: "",
          distributionPeriod: "2", // Changed from "1" to "2"
          termsAgreed: false,
          dataSharing: false,
        })
        setSignatureData(null)
        setAuthorizationSignatureData(null)
        setWantsAuthorization(false)
        setErrors({})

        // Reset signature canvases by triggering a re-render
        const signatureCanvases = document.querySelectorAll("canvas")
        signatureCanvases.forEach((canvas) => {
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.fillStyle = "#f9fafb"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.strokeStyle = "#d1d5db"
            ctx.lineWidth = 1
            ctx.strokeRect(0, 0, canvas.width, canvas.height)
          }
        })
      } else {
        throw new Error("Failed to save form")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Eroare",
        description: "A apărut o eroare la trimiterea formularului. Vă rugăm să încercați din nou.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFullAddress = () => {
    let address = formData.street
    if (formData.number) address += ` nr. ${formData.number}`
    if (formData.block) address += `, bl. ${formData.block}`
    if (formData.entrance) address += `, sc. ${formData.entrance}`
    if (formData.floor) address += `, et. ${formData.floor}`
    if (formData.apartment) address += `, ap. ${formData.apartment}`
    if (formData.city) address += `, ${formData.city}`
    if (formData.county) address += `, jud. ${formData.county}`
    return address
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("ro-RO")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-purple-800">Date personale</CardTitle>
          <CardDescription>Completează datele tale personale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">NUME DE FAMILIE*</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Popescu"
                className={errors.lastName ? "border-red-500" : ""}
                required
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">PRENUME*</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Ion"
                className={errors.firstName ? "border-red-500" : ""}
                required
              />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnp">COD NUMERIC PERSONAL (CNP)*</Label>
            <Input
              id="cnp"
              value={formData.cnp}
              onChange={(e) => handleInputChange("cnp", e.target.value)}
              placeholder="1900101123456"
              className={errors.cnp ? "border-red-500" : ""}
              maxLength={13}
              required
            />
            {errors.cnp && <p className="text-red-500 text-sm">{errors.cnp}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-MAIL*</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="ion.popescu@email.com"
                className={errors.email ? "border-red-500" : ""}
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">TELEFON*</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="0721234567"
                className={errors.phone ? "border-red-500" : ""}
                required
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-purple-800">Adresa</CardTitle>
          <CardDescription>Completează adresa așa cum apare în cartea de identitate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">STRADA*</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              placeholder="Strada Victoriei"
              className={errors.street ? "border-red-500" : ""}
              required
            />
            {errors.street && <p className="text-red-500 text-sm">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">NUMĂR*</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => handleInputChange("number", e.target.value)}
                placeholder="123"
                className={errors.number ? "border-red-500" : ""}
                required
              />
              {errors.number && <p className="text-red-500 text-sm">{errors.number}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="block">BLOC</Label>
              <Input
                id="block"
                value={formData.block}
                onChange={(e) => handleInputChange("block", e.target.value)}
                placeholder="A1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entrance">SCARA</Label>
              <Input
                id="entrance"
                value={formData.entrance}
                onChange={(e) => handleInputChange("entrance", e.target.value)}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">ETAJ</Label>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) => handleInputChange("floor", e.target.value)}
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apartment">APARTAMENT</Label>
              <Input
                id="apartment"
                value={formData.apartment}
                onChange={(e) => handleInputChange("apartment", e.target.value)}
                placeholder="15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="county">JUDEȚ / SECTOR*</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => handleInputChange("county", e.target.value)}
                placeholder="București"
                className={errors.county ? "border-red-500" : ""}
                required
              />
              {errors.county && <p className="text-red-500 text-sm">{errors.county}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">LOCALITATE*</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Sector 1"
                className={errors.city ? "border-red-500" : ""}
                required
              />
              {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-purple-800">Destinația sumei de până la 3,5% din impozitul anual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-sm leading-relaxed">
              <strong>Solicit redirecționarea sumei reprezentând până la 3,5% din impozitul anual datorat</strong>,
              conform prevederilor art. 123¹ din Legea nr. 227/2015, către următoarea entitate nonprofit:
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Denumire entitate nonprofit:</strong> Asociația "Inițiativa Vâlcea Inovează"
              </p>
              <p>
                <strong>Cod de identificare fiscală:</strong> 44291122
              </p>
              <p>
                <strong>Cont bancar (IBAN):</strong> RO86BTRLRONCRT0596202401
              </p>
              <p>
                <strong>Adresa:</strong> Jud. Vâlcea, Mun. Râmnicu Vâlcea, Str. Calea lui Traian nr. 79, bl. S24, sc. A,
                et. 4, ap. 19
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-purple-800">Opțiuni și semnătură</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Opțiune privind distribuirea sumei pentru o perioadă de:</Label>
            <RadioGroup
              value={formData.distributionPeriod}
              onValueChange={(value) => handleInputChange("distributionPeriod", value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="period-1" />
                <Label htmlFor="period-1">1 an</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="period-2" />
                <Label htmlFor="period-2">2 ani</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Semnătura*</Label>
            <SignatureCanvas onSignatureChange={setSignatureData} />
            <div className="text-sm text-gray-600 space-y-2">
              <p>Desenați semnătura în spațiul de mai sus. Apăsați pe "Șterge" pentru a reîncerca.</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium">Informații importante:</p>
                <p>
                  Formularul se completează de către contribuabil și poate fi depus personal, prin împuternicit, prin
                  poștă sau prin mijloace electronice de transmitere la distanță.
                </p>
                <p className="mt-2">
                  Redirecționarea celor 3,5% nu reprezintă o donație și nu implică niciun cost – este vorba de o parte
                  din impozitul deja reținut de stat pentru veniturile din anul trecut.
                </p>
              </div>
            </div>
            {errors.signature && <p className="text-red-500 text-sm">{errors.signature}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="termsAgreed"
                checked={formData.termsAgreed}
                onCheckedChange={(checked) => handleInputChange("termsAgreed", checked === true)}
                required
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="termsAgreed"
                  className={`text-sm font-normal ${errors.termsAgreed ? "text-red-500" : ""}`}
                >
                  Sunt de acord cu termenii și condițiile pentru donații și cu politica de confidențialitate*
                </Label>
                {errors.termsAgreed && <p className="text-red-500 text-sm">{errors.termsAgreed}</p>}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="dataSharing"
                checked={formData.dataSharing}
                onCheckedChange={(checked) => handleInputChange("dataSharing", checked === true)}
                required
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="dataSharing"
                  className={`text-sm font-normal ${errors.dataSharing ? "text-red-500" : ""}`}
                >
                  Sunt de acord ca datele de identificare (nume, prenume și cod numeric personal), precum și suma
                  direcționată să fie comunicate către Asociația "Inițiativa Vâlcea Inovează".*
                </Label>
                {errors.dataSharing && <p className="text-red-500 text-sm">{errors.dataSharing}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authorization Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-purple-800">Împuternicire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-3">
            <Switch id="authorization-toggle" checked={wantsAuthorization} onCheckedChange={setWantsAuthorization} />
            <Label htmlFor="authorization-toggle" className="text-base font-medium">
              Doresc să împuternicesc Asociația "Inițiativa Vâlcea Inovează" pentru a depune acest formular pentru mine
            </Label>
          </div>

          {wantsAuthorization && (
            <div className="space-y-6 border-t pt-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-center mb-4">ÎMPUTERNICIRE</h4>
                <div className="text-sm leading-relaxed space-y-2">
                  <p>
                    Subsemnatul/a{" "}
                    <span className="font-medium">
                      {formData.firstName} {formData.lastName}
                    </span>
                    , identificat/a cu CNP <span className="font-medium">{formData.cnp}</span>, domiciliat/a în{" "}
                    <span className="font-medium">{getFullAddress()}</span>, împuternicesc Asociația "Inițiativa Vâlcea
                    Inovează", CIF 44291122, cu sediul în Mun. Râmnicu Vâlcea, Str. Calea lui Traian nr. 79, bl. S24,
                    sc. A, et. 4, ap. 19, jud. Vâlcea, reprezentată legal prin Vasile Cătălin, să depună în numele meu
                    Formularul 230 privind redirecționarea a până la 3,5% din impozitul pe venitul meu anual datorat
                    către această entitate nonprofit.
                  </p>
                  <p className="mt-4">Prezenta împuternicire este valabilă exclusiv pentru acest scop.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Semnătura pentru împuternicire*</Label>
                  <SignatureCanvas onSignatureChange={setAuthorizationSignatureData} />
                  {errors.authorizationSignature && (
                    <p className="text-red-500 text-sm">{errors.authorizationSignature}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Data</Label>
                  <div className="p-3 bg-gray-100 rounded-md">
                    <span className="font-medium">{getCurrentDate()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          type="submit"
          className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Se trimite..." : "Trimite formularul"}
        </Button>
      </div>
    </form>
  )
}
