'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, Loader2, BarChart3 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/store/app-store'
import { apiFetch } from '@/lib/fetch'

const L = (en: string, fil: string) => {
  const lang = useAppStore.getState().language
  return lang === 'fil' ? fil : en
}

const downloadCSV = (data: Record<string, any>[], filename: string) => {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function FiraReportsPage() {
  const { language } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [deployedApps, setDeployedApps] = useState<any[]>([])
  const [endorsements, setEndorsements] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [appsRes, deployedRes, endRes] = await Promise.all([
          apiFetch('/api/applications'),
          apiFetch('/api/applications?status=deployed'),
          apiFetch('/api/endorsements'),
        ])
        const appsData = await appsRes.json()
        const deployedData = await deployedRes.json()
        const endData = await endRes.json()
        setApplications(appsData.applications || [])
        setDeployedApps(deployedData.applications || [])
        setEndorsements(endData.endorsements || [])
      } catch (err) {
        console.error('Reports fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // --- Application Status Report ---
  const statusCounts: Record<string, number> = {}
  applications.forEach((a) => {
    const s = a.status || 'unknown'
    statusCounts[s] = (statusCounts[s] || 0) + 1
  })
  const statusRows = Object.entries(statusCounts).map(([status, count]) => ({
    [language === 'fil' ? 'Status' : 'Status']: status,
    [language === 'fil' ? 'Bilang' : 'Count']: count,
  }))

  // --- Deployment Report ---
  const deployedRows = deployedApps.map((a) => ({
    [language === 'fil' ? 'Aplikante' : 'Applicant']: a.applicant?.name || a.applicantId || '',
    [language === 'fil' ? 'Trabaho' : 'Job Title']: a.jobOrder?.title || '',
    [language === 'fil' ? 'Empleyador' : 'Employer']: a.jobOrder?.employer?.companyName || '',
    [language === 'fil' ? 'Petsa' : 'Date']: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : '',
  }))

  // --- Agency Performance ---
  const agencyCounts: Record<string, number> = {}
  endorsements.forEach((e) => {
    const agencyName = e.endorser?.name || e.endorsedById || 'Unknown'
    agencyCounts[agencyName] = (agencyCounts[agencyName] || 0) + 1
  })
  const agencyRows = Object.entries(agencyCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([agency, count]) => ({
      [language === 'fil' ? 'Ahensya / Nag-endorso' : 'Agency / Endorser']: agency,
      [language === 'fil' ? 'Bilang ng Endorso' : 'Endorsements']: count,
    }))

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" />
          {L('Reports', 'Mga Ulat')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {L('View and export data reports', 'Tingnan at i-export ang mga ulat ng datos')}
        </p>
      </div>

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">
            {L('Application Status', 'Status ng Aplikasyon')}
          </TabsTrigger>
          <TabsTrigger value="deployment">
            {L('Deployment', 'Pag-deploy')}
          </TabsTrigger>
          <TabsTrigger value="agency">
            {L('Agency Performance', 'Pagganap ng Ahensya')}
          </TabsTrigger>
        </TabsList>

        {/* Application Status Report */}
        <TabsContent value="status" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {L('Application Status Report', 'Ulat ng Status ng Aplikasyon')}
              </CardTitle>
              {!loading && statusRows.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(statusRows, 'application-status-report.csv')}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  {L('Download CSV', 'I-download ang CSV')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : statusRows.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  {L('No application data available.', 'Walang available na datos ng aplikasyon.')}
                </p>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{L('Status', 'Status')}</TableHead>
                        <TableHead className="text-right">{L('Count', 'Bilang')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statusRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row[language === 'fil' ? 'Status' : 'Status']}</TableCell>
                          <TableCell className="text-right font-medium">
                            {row[language === 'fil' ? 'Bilang' : 'Count']}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployment Report */}
        <TabsContent value="deployment" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {L('Deployment Report', 'Ulat ng Pag-deploy')}
              </CardTitle>
              {!loading && deployedRows.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(deployedRows, 'deployment-report.csv')}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  {L('Download CSV', 'I-download ang CSV')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : deployedRows.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  {L('No deployed applications found.', 'Walang na-deploy na aplikasyon na nahanap.')}
                </p>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{L('Applicant', 'Aplikante')}</TableHead>
                        <TableHead>{L('Job Title', 'Trabaho')}</TableHead>
                        <TableHead>{L('Employer', 'Empleyador')}</TableHead>
                        <TableHead>{L('Date', 'Petsa')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deployedRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row[language === 'fil' ? 'Aplikante' : 'Applicant']}</TableCell>
                          <TableCell>{row[language === 'fil' ? 'Trabaho' : 'Job Title']}</TableCell>
                          <TableCell>{row[language === 'fil' ? 'Empleyador' : 'Employer']}</TableCell>
                          <TableCell>{row[language === 'fil' ? 'Petsa' : 'Date']}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agency Performance */}
        <TabsContent value="agency" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {L('Agency Performance', 'Pagganap ng Ahensya')}
              </CardTitle>
              {!loading && agencyRows.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(agencyRows, 'agency-performance-report.csv')}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  {L('Download CSV', 'I-download ang CSV')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : agencyRows.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  {L('No endorsement data available.', 'Walang datos ng endorso na available.')}
                </p>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{L('Agency / Endorser', 'Ahensya / Nag-endorso')}</TableHead>
                        <TableHead className="text-right">
                          {L('Endorsements', 'Bilang ng Endorso')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agencyRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row[language === 'fil' ? 'Ahensya / Nag-endorso' : 'Agency / Endorser']}</TableCell>
                          <TableCell className="text-right font-medium">
                            {row[language === 'fil' ? 'Bilang ng Endorso' : 'Endorsements']}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
