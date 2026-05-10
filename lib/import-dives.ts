import * as XLSX from 'xlsx'
import type { DiveEntry, MarineLifeEntry } from '@/lib/types'

interface ExcelRow {
  country?: string
  siteName?: string
  date?: string
  dayNumber?: string | number
  maxDepth?: string | number
  duration?: string | number
  waterTemp?: string | number
  marineLife?: string
  notes?: string
  buddyName?: string
  location?: string
}

function parseNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

function parseMarineLife(value: string | undefined): MarineLifeEntry[] {
  if (!value) return []
  return value.split(/[,;]/).map(name => ({
    name: name.trim(),
    custom: true,
  })).filter(entry => entry.name.length > 0)
}

function parseDate(value: string | undefined): string {
  if (!value) return new Date().toISOString().split('T')[0]
  
  // Handle Excel serial date numbers
  if (!isNaN(Number(value))) {
    const excelDate = Number(value)
    const date = new Date((excelDate - 25569) * 86400 * 1000)
    return date.toISOString().split('T')[0]
  }
  
  // Try parsing as regular date
  const parsed = new Date(value)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }
  
  return value
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[\s_]/g, '').trim()
}

function getFieldValue(row: Record<string, unknown>, field: string, alternatives: string[]): string {
  const normalizedField = normalizeHeader(field)
  const allOptions = [field, ...alternatives].map(normalizeHeader)
  
  for (const opt of allOptions) {
    for (const key of Object.keys(row)) {
      if (normalizeHeader(key) === opt && row[key]) {
        return String(row[key])
      }
    }
  }
  return ''
}

function getNumberValue(row: Record<string, unknown>, field: string, alternatives: string[]): number {
  const str = getFieldValue(row, field, alternatives)
  return parseNumber(str)
}

export function parseExcelFile(file: File): Promise<DiveEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:G1')
        const dives: DiveEntry[] = []
        
        for (let rowIdx = range.s.r + 1; rowIdx <= range.e.r; rowIdx++) {
          const getCellValue = (col: number): string => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIdx, c: col })
            const cell = sheet[cellRef]
            return cell ? String(cell.v || '') : ''
          }
          
          const col0 = getCellValue(0)
          const col1 = getCellValue(1)
          const col2 = getCellValue(2)
          const col3 = getCellValue(3)
          const col4 = getCellValue(4)
          const col5 = getCellValue(5)
          const col6 = getCellValue(6)
          
          if (dives.length < 3) {
            console.log(`Row ${rowIdx}: country=${col0}, site=${col1}, date=${col2}, day=${col3}, depth=${col4}, duration=${col5}, notes=${col6}`)
          }
          
          const maxDepthFeet = parseNumber(col4)
          const maxDepthMeters = maxDepthFeet ? Math.round(maxDepthFeet / 3.28084) : 0
          
          dives.push({
            id: `import-${Date.now()}-${rowIdx}`,
            country: col0,
            siteName: col1 || 'Unknown Site',
            date: parseDate(col2),
            dayNumber: parseNumber(col3),
            location: col0,
            maxDepth: maxDepthMeters,
            duration: parseNumber(col5),
            waterTemp: 0,
            buddyName: '',
            marineLife: [],
            notes: col6,
            photos: [],
            createdAt: new Date().toISOString(),
          })
        }
        
        resolve(dives)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export function parseCsvFile(file: File): Promise<DiveEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          resolve([])
          return
        }
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
        const dives: DiveEntry[] = []
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''))
          const row: Record<string, string> = {}
          
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          
          dives.push({
            id: `import-${Date.now()}-${i}`,
            country: row.country || '',
            siteName: row.sitename || row['site name'] || row.name || 'Unknown Site',
            date: parseDate(row.date),
            dayNumber: parseNumber(row.daynumber || row['day number'] || row.day),
            location: row.location || '',
            maxDepth: parseNumber(row.maxdepth || row['max depth']),
            duration: parseNumber(row.duration || row.time),
            waterTemp: parseNumber(row.watertemp || row['water temp'] || row.temperature),
            buddyName: row.buddy || row.buddyname || row['buddy name'] || '',
            marineLife: parseMarineLife(row.marinelife || row['marine life'] || row.species),
            notes: row.notes || row.description || '',
            photos: [],
            createdAt: new Date().toISOString(),
          })
        }
        
        resolve(dives)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export async function importDives(file: File): Promise<DiveEntry[]> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (extension === 'csv') {
    return parseCsvFile(file)
  }
  
  return parseExcelFile(file)
}