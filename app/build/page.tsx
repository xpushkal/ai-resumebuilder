"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Save, Download, Plus, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function BuildResume() {
  const [activeSection, setActiveSection] = useState("personal")
  const [previewMode, setPreviewMode] = useState(false)

  // Personal information state
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    summary: "",
  })

  // Work experience state
  const [workExperiences, setWorkExperiences] = useState([
    {
      id: 1,
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      achievements: [""],
    },
  ])

  // Education state
  const [educations, setEducations] = useState([
    {
      id: 1,
      degree: "",
      institution: "",
      location: "",
      graduationDate: "",
      gpa: "",
      relevantCourses: "",
    },
  ])

  // Skills state
  const [skills, setSkills] = useState({
    technical: [""],
    soft: [""],
    languages: [""],
    certifications: [""],
  })

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPersonalInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleWorkExperienceChange = (id: number, field: string, value: string | boolean) => {
    setWorkExperiences((prev) => prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }

  const handleWorkAchievementChange = (expId: number, index: number, value: string) => {
    setWorkExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id === expId) {
          const newAchievements = [...exp.achievements]
          newAchievements[index] = value
          return { ...exp, achievements: newAchievements }
        }
        return exp
      }),
    )
  }

  const addWorkAchievement = (expId: number) => {
    setWorkExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id === expId) {
          return { ...exp, achievements: [...exp.achievements, ""] }
        }
        return exp
      }),
    )
  }

  const removeWorkAchievement = (expId: number, index: number) => {
    setWorkExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id === expId && exp.achievements.length > 1) {
          const newAchievements = [...exp.achievements]
          newAchievements.splice(index, 1)
          return { ...exp, achievements: newAchievements }
        }
        return exp
      }),
    )
  }

  const addWorkExperience = () => {
    const newId = workExperiences.length > 0 ? Math.max(...workExperiences.map((exp) => exp.id)) + 1 : 1

    setWorkExperiences((prev) => [
      ...prev,
      {
        id: newId,
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        achievements: [""],
      },
    ])
  }

  const removeWorkExperience = (id: number) => {
    if (workExperiences.length > 1) {
      setWorkExperiences((prev) => prev.filter((exp) => exp.id !== id))
    }
  }

  const handleEducationChange = (id: number, field: string, value: string) => {
    setEducations((prev) => prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)))
  }

  const addEducation = () => {
    const newId = educations.length > 0 ? Math.max(...educations.map((edu) => edu.id)) + 1 : 1

    setEducations((prev) => [
      ...prev,
      {
        id: newId,
        degree: "",
        institution: "",
        location: "",
        graduationDate: "",
        gpa: "",
        relevantCourses: "",
      },
    ])
  }

  const removeEducation = (id: number) => {
    if (educations.length > 1) {
      setEducations((prev) => prev.filter((edu) => edu.id !== id))
    }
  }

  const handleSkillChange = (category: keyof typeof skills, index: number, value: string) => {
    setSkills((prev) => {
      const newSkills = { ...prev }
      newSkills[category][index] = value
      return newSkills
    })
  }

  const addSkill = (category: keyof typeof skills) => {
    setSkills((prev) => {
      const newSkills = { ...prev }
      newSkills[category] = [...newSkills[category], ""]
      return newSkills
    })
  }

  const removeSkill = (category: keyof typeof skills, index: number) => {
    if (skills[category].length > 1) {
      setSkills((prev) => {
        const newSkills = { ...prev }
        newSkills[category] = newSkills[category].filter((_, i) => i !== index)
        return newSkills
      })
    }
  }

  const generateResume = () => {
    setPreviewMode(true)
    // In a real implementation, this would generate the resume
    // and possibly use AI to enhance content
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <FileText className="h-6 w-6" />
              <span>ResumeAI</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="font-medium">
              Home
            </Link>
            <Link href="/check" className="font-medium">
              Check Resume
            </Link>
            <Link href="/build" className="font-medium">
              Build Resume
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </div>

          <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">AI Resume Builder</h1>
                <p className="text-gray-500 md:text-xl mt-2">
                  Create a professional resume with AI-powered suggestions
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="preview-mode" checked={previewMode} onCheckedChange={setPreviewMode} />
                  <Label htmlFor="preview-mode">Preview Mode</Label>
                </div>
                <Button onClick={generateResume}>
                  <Eye className="mr-2 h-4 w-4" /> Preview Resume
                </Button>
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" /> Save Draft
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </div>
            </div>

            {!previewMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Resume Sections</CardTitle>
                    <CardDescription>Fill out each section to complete your resume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant={activeSection === "personal" ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveSection("personal")}
                      >
                        Personal Information
                      </Button>
                      <Button
                        variant={activeSection === "experience" ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveSection("experience")}
                      >
                        Work Experience
                      </Button>
                      <Button
                        variant={activeSection === "education" ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveSection("education")}
                      >
                        Education
                      </Button>
                      <Button
                        variant={activeSection === "skills" ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveSection("skills")}
                      >
                        Skills & Certifications
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>
                      {activeSection === "personal" && "Personal Information"}
                      {activeSection === "experience" && "Work Experience"}
                      {activeSection === "education" && "Education"}
                      {activeSection === "skills" && "Skills & Certifications"}
                    </CardTitle>
                    <CardDescription>
                      {activeSection === "personal" && "Add your contact details and professional summary"}
                      {activeSection === "experience" && "Add your work history and achievements"}
                      {activeSection === "education" && "Add your educational background"}
                      {activeSection === "skills" && "Add your skills, languages, and certifications"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeSection === "personal" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              placeholder="John Doe"
                              value={personalInfo.fullName}
                              onChange={handlePersonalInfoChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="john.doe@example.com"
                              value={personalInfo.email}
                              onChange={handlePersonalInfoChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              name="phone"
                              placeholder="(123) 456-7890"
                              value={personalInfo.phone}
                              onChange={handlePersonalInfoChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              name="location"
                              placeholder="City, State"
                              value={personalInfo.location}
                              onChange={handlePersonalInfoChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                              id="linkedin"
                              name="linkedin"
                              placeholder="linkedin.com/in/johndoe"
                              value={personalInfo.linkedin}
                              onChange={handlePersonalInfoChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">Website/Portfolio</Label>
                            <Input
                              id="website"
                              name="website"
                              placeholder="johndoe.com"
                              value={personalInfo.website}
                              onChange={handlePersonalInfoChange}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="summary">Professional Summary</Label>
                          <Textarea
                            id="summary"
                            name="summary"
                            placeholder="Experienced professional with expertise in..."
                            className="min-h-[150px]"
                            value={personalInfo.summary}
                            onChange={handlePersonalInfoChange}
                          />
                          <p className="text-sm text-gray-500">
                            A strong summary highlights your key qualifications and career goals in 3-5 sentences.
                          </p>
                          <Button variant="outline" size="sm">
                            Generate AI Summary
                          </Button>
                        </div>
                      </div>
                    )}

                    {activeSection === "experience" && (
                      <div className="space-y-6">
                        {workExperiences.map((exp, index) => (
                          <div key={exp.id} className="space-y-4 pb-6 border-b last:border-0">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium">Position {index + 1}</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeWorkExperience(exp.id)}
                                disabled={workExperiences.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`job-title-${exp.id}`}>Job Title</Label>
                                <Input
                                  id={`job-title-${exp.id}`}
                                  placeholder="Senior Developer"
                                  value={exp.title}
                                  onChange={(e) => handleWorkExperienceChange(exp.id, "title", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`company-${exp.id}`}>Company</Label>
                                <Input
                                  id={`company-${exp.id}`}
                                  placeholder="Acme Inc."
                                  value={exp.company}
                                  onChange={(e) => handleWorkExperienceChange(exp.id, "company", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`location-${exp.id}`}>Location</Label>
                                <Input
                                  id={`location-${exp.id}`}
                                  placeholder="City, State or Remote"
                                  value={exp.location}
                                  onChange={(e) => handleWorkExperienceChange(exp.id, "location", e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                  <Label htmlFor={`start-date-${exp.id}`}>Start Date</Label>
                                  <Input
                                    id={`start-date-${exp.id}`}
                                    placeholder="MM/YYYY"
                                    value={exp.startDate}
                                    onChange={(e) => handleWorkExperienceChange(exp.id, "startDate", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`end-date-${exp.id}`}>End Date</Label>
                                  <Input
                                    id={`end-date-${exp.id}`}
                                    placeholder="MM/YYYY or Present"
                                    value={exp.endDate}
                                    onChange={(e) => handleWorkExperienceChange(exp.id, "endDate", e.target.value)}
                                    disabled={exp.current}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`current-job-${exp.id}`}
                                checked={exp.current}
                                onCheckedChange={(checked) => handleWorkExperienceChange(exp.id, "current", checked)}
                              />
                              <Label htmlFor={`current-job-${exp.id}`}>I currently work here</Label>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`job-description-${exp.id}`}>Job Description</Label>
                              <Textarea
                                id={`job-description-${exp.id}`}
                                placeholder="Describe your role and responsibilities..."
                                value={exp.description}
                                onChange={(e) => handleWorkExperienceChange(exp.id, "description", e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label>Key Achievements</Label>
                                <Button variant="outline" size="sm" onClick={() => addWorkAchievement(exp.id)}>
                                  <Plus className="h-4 w-4 mr-1" /> Add Achievement
                                </Button>
                              </div>

                              {exp.achievements.map((achievement, i) => (
                                <div key={i} className="flex gap-2">
                                  <Input
                                    placeholder="Increased revenue by 20% through..."
                                    value={achievement}
                                    onChange={(e) => handleWorkAchievementChange(exp.id, i, e.target.value)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeWorkAchievement(exp.id, i)}
                                    disabled={exp.achievements.length <= 1}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}

                              <Button variant="outline" size="sm">
                                Generate AI Achievements
                              </Button>
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" className="w-full" onClick={addWorkExperience}>
                          <Plus className="h-4 w-4 mr-2" /> Add Another Position
                        </Button>
                      </div>
                    )}

                    {activeSection === "education" && (
                      <div className="space-y-6">
                        {educations.map((edu, index) => (
                          <div key={edu.id} className="space-y-4 pb-6 border-b last:border-0">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium">Education {index + 1}</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEducation(edu.id)}
                                disabled={educations.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`degree-${edu.id}`}>Degree/Certificate</Label>
                                <Input
                                  id={`degree-${edu.id}`}
                                  placeholder="Bachelor of Science in Computer Science"
                                  value={edu.degree}
                                  onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                                <Input
                                  id={`institution-${edu.id}`}
                                  placeholder="University of Technology"
                                  value={edu.institution}
                                  onChange={(e) => handleEducationChange(edu.id, "institution", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`edu-location-${edu.id}`}>Location</Label>
                                <Input
                                  id={`edu-location-${edu.id}`}
                                  placeholder="City, State"
                                  value={edu.location}
                                  onChange={(e) => handleEducationChange(edu.id, "location", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`graduation-date-${edu.id}`}>Graduation Date</Label>
                                <Input
                                  id={`graduation-date-${edu.id}`}
                                  placeholder="MM/YYYY or Expected MM/YYYY"
                                  value={edu.graduationDate}
                                  onChange={(e) => handleEducationChange(edu.id, "graduationDate", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`gpa-${edu.id}`}>GPA (Optional)</Label>
                                <Input
                                  id={`gpa-${edu.id}`}
                                  placeholder="3.8/4.0"
                                  value={edu.gpa}
                                  onChange={(e) => handleEducationChange(edu.id, "gpa", e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`relevant-courses-${edu.id}`}>Relevant Coursework (Optional)</Label>
                              <Textarea
                                id={`relevant-courses-${edu.id}`}
                                placeholder="List relevant courses separated by commas..."
                                value={edu.relevantCourses}
                                onChange={(e) => handleEducationChange(edu.id, "relevantCourses", e.target.value)}
                              />
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" className="w-full" onClick={addEducation}>
                          <Plus className="h-4 w-4 mr-2" /> Add Another Education
                        </Button>
                      </div>
                    )}

                    {activeSection === "skills" && (
                      <div className="space-y-6">
                        <Tabs defaultValue="technical">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="technical">Technical Skills</TabsTrigger>
                            <TabsTrigger value="soft">Soft Skills</TabsTrigger>
                            <TabsTrigger value="languages">Languages</TabsTrigger>
                            <TabsTrigger value="certifications">Certifications</TabsTrigger>
                          </TabsList>

                          <TabsContent value="technical" className="space-y-4 pt-4">
                            <div className="flex justify-between items-center">
                              <Label>Technical Skills</Label>
                              <Button variant="outline" size="sm" onClick={() => addSkill("technical")}>
                                <Plus className="h-4 w-4 mr-1" /> Add Skill
                              </Button>
                            </div>

                            {skills.technical.map((skill, i) => (
                              <div key={i} className="flex gap-2">
                                <Input
                                  placeholder="JavaScript, React, Node.js, etc."
                                  value={skill}
                                  onChange={(e) => handleSkillChange("technical", i, e.target.value)}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSkill("technical", i)}
                                  disabled={skills.technical.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}

                            <Button variant="outline" size="sm">
                              Suggest Skills Based on Experience
                            </Button>
                          </TabsContent>

                          <TabsContent value="soft" className="space-y-4 pt-4">
                            <div className="flex justify-between items-center">
                              <Label>Soft Skills</Label>
                              <Button variant="outline" size="sm" onClick={() => addSkill("soft")}>
                                <Plus className="h-4 w-4 mr-1" /> Add Skill
                              </Button>
                            </div>

                            {skills.soft.map((skill, i) => (
                              <div key={i} className="flex gap-2">
                                <Input
                                  placeholder="Leadership, Communication, Problem-solving, etc."
                                  value={skill}
                                  onChange={(e) => handleSkillChange("soft", i, e.target.value)}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSkill("soft", i)}
                                  disabled={skills.soft.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </TabsContent>

                          <TabsContent value="languages" className="space-y-4 pt-4">
                            <div className="flex justify-between items-center">
                              <Label>Languages</Label>
                              <Button variant="outline" size="sm" onClick={() => addSkill("languages")}>
                                <Plus className="h-4 w-4 mr-1" /> Add Language
                              </Button>
                            </div>

                            {skills.languages.map((language, i) => (
                              <div key={i} className="flex gap-2">
                                <Input
                                  placeholder="English (Native), Spanish (Fluent), etc."
                                  value={language}
                                  onChange={(e) => handleSkillChange("languages", i, e.target.value)}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSkill("languages", i)}
                                  disabled={skills.languages.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </TabsContent>

                          <TabsContent value="certifications" className="space-y-4 pt-4">
                            <div className="flex justify-between items-center">
                              <Label>Certifications</Label>
                              <Button variant="outline" size="sm" onClick={() => addSkill("certifications")}>
                                <Plus className="h-4 w-4 mr-1" /> Add Certification
                              </Button>
                            </div>

                            {skills.certifications.map((cert, i) => (
                              <div key={i} className="flex gap-2">
                                <Input
                                  placeholder="AWS Certified Solutions Architect, Google Analytics, etc."
                                  value={cert}
                                  onChange={(e) => handleSkillChange("certifications", i, e.target.value)}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSkill("certifications", i)}
                                  disabled={skills.certifications.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Resume Preview</CardTitle>
                  <CardDescription>This is how your resume will look when downloaded</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-8 bg-white">
                    {/* Resume Preview */}
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">{personalInfo.fullName || "Your Name"}</h2>
                        <div className="flex flex-wrap justify-center gap-x-4 text-sm">
                          {personalInfo.email && <span>{personalInfo.email}</span>}
                          {personalInfo.phone && <span>{personalInfo.phone}</span>}
                          {personalInfo.location && <span>{personalInfo.location}</span>}
                          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
                          {personalInfo.website && <span>{personalInfo.website}</span>}
                        </div>
                      </div>

                      {/* Summary */}
                      {personalInfo.summary && (
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-1 mb-2">Professional Summary</h3>
                          <p>{personalInfo.summary}</p>
                        </div>
                      )}

                      {/* Experience */}
                      {workExperiences.some((exp) => exp.title || exp.company) && (
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-1 mb-2">Work Experience</h3>
                          <div className="space-y-4">
                            {workExperiences.map((exp, i) =>
                              exp.title || exp.company ? (
                                <div key={i}>
                                  <div className="flex justify-between">
                                    <div>
                                      <h4 className="font-medium">{exp.title || "Job Title"}</h4>
                                      <p>
                                        {exp.company || "Company"}
                                        {exp.location ? `, ${exp.location}` : ""}
                                      </p>
                                    </div>
                                    <p className="text-sm">
                                      {exp.startDate || "Start Date"} -{" "}
                                      {exp.current ? "Present" : exp.endDate || "End Date"}
                                    </p>
                                  </div>
                                  {exp.description && <p className="mt-1">{exp.description}</p>}
                                  {exp.achievements.some((a) => a) && (
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                      {exp.achievements.map((achievement, j) =>
                                        achievement ? <li key={j}>{achievement}</li> : null,
                                      )}
                                    </ul>
                                  )}
                                </div>
                              ) : null,
                            )}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {educations.some((edu) => edu.degree || edu.institution) && (
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-1 mb-2">Education</h3>
                          <div className="space-y-4">
                            {educations.map((edu, i) =>
                              edu.degree || edu.institution ? (
                                <div key={i}>
                                  <div className="flex justify-between">
                                    <div>
                                      <h4 className="font-medium">{edu.degree || "Degree"}</h4>
                                      <p>
                                        {edu.institution || "Institution"}
                                        {edu.location ? `, ${edu.location}` : ""}
                                      </p>
                                    </div>
                                    <p className="text-sm">{edu.graduationDate || "Graduation Date"}</p>
                                  </div>
                                  {edu.gpa && <p className="mt-1">GPA: {edu.gpa}</p>}
                                  {edu.relevantCourses && (
                                    <p className="mt-1">
                                      <span className="font-medium">Relevant Coursework:</span> {edu.relevantCourses}
                                    </p>
                                  )}
                                </div>
                              ) : null,
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      <div>
                        <h3 className="text-lg font-semibold border-b pb-1 mb-2">Skills</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {skills.technical.some((s) => s) && (
                            <div>
                              <h4 className="font-medium">Technical Skills</h4>
                              <p>{skills.technical.filter((s) => s).join(", ")}</p>
                            </div>
                          )}

                          {skills.soft.some((s) => s) && (
                            <div>
                              <h4 className="font-medium">Soft Skills</h4>
                              <p>{skills.soft.filter((s) => s).join(", ")}</p>
                            </div>
                          )}

                          {skills.languages.some((s) => s) && (
                            <div>
                              <h4 className="font-medium">Languages</h4>
                              <p>{skills.languages.filter((s) => s).join(", ")}</p>
                            </div>
                          )}

                          {skills.certifications.some((s) => s) && (
                            <div>
                              <h4 className="font-medium">Certifications</h4>
                              <p>{skills.certifications.filter((s) => s).join(", ")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                Back to Editor
              </Button>
              <div className="space-x-2">
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" /> Save Draft
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-gray-500">© 2025 ResumeAI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

