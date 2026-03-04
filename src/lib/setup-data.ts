// Centralized Setup Data - Single source of truth for all setup configurations
// This file manages all the dropdown options and configurations used throughout the system

export interface SetupData {
  categories: Category[]
  locations: Location[]
  sites: Site[]
  departments: Department[]
  employees: Employee[]
  manufacturers: Manufacturer[]
  customers: Customer[]
  conditions: Condition[]
  statuses: Status[]
}

export interface Category {
  id: string
  name: string
  description: string
  parentCategory?: string
  assetCount: number
  isActive: boolean
}

export interface Location {
  id: string
  name: string
  description: string
  site?: string
  floor?: string
  room?: string
  assetCount: number
  isActive: boolean
}

export interface Site {
  id: string
  name: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  assetCount: number
  isActive: boolean
}

export interface Department {
  id: string
  name: string
  description: string
  manager?: string
  budget?: number
  assetCount: number
  isActive: boolean
}

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  phone?: string
  employeeId: string
  isActive: boolean
}

export interface Manufacturer {
  id: string
  name: string
  website?: string
  contactEmail?: string
  assetCount: number
  isActive: boolean
}

export interface Customer {
  id: string
  name: string
  type: 'Corporate' | 'Individual'
  email?: string
  phone?: string
  address?: string
  contactPerson?: string
  isActive: boolean
}

export interface Condition {
  id: string
  name: string
  description: string
  color: string
  isActive: boolean
}

export interface Status {
  id: string
  name: string
  description: string
  color: string
  isActive: boolean
}

// Default setup data
export const DEFAULT_SETUP_DATA: SetupData = {
  categories: [
    {
      id: "1",
      name: "IT EQUIPMENT",
      description: "Laptops, desktops, monitors, and computer accessories",
      assetCount: 30,
      isActive: true
    },
    {
      id: "13",
      name: "NETWORK EQUIPMENT",
      description: "Servers, switches, routers, firewalls, and networking infrastructure",
      assetCount: 9,
      isActive: true
    },
    {
      id: "2",
      name: "FURNITURE",
      description: "Desks, chairs, tables, and office furniture",
      assetCount: 13,
      isActive: true
    },
    {
      id: "4",
      name: "OFFICE EQUIPMENT",
      description: "Printers, scanners, copiers, and office machines",
      assetCount: 12,
      isActive: true
    },
    {
      id: "5",
      name: "SECURITY EQUIPMENT",
      description: "Cameras, access control systems, and security devices",
      assetCount: 15,
      isActive: true
    },
    {
      id: "6",
      name: "HVAC EQUIPMENT",
      description: "Heating, ventilation, and air conditioning systems",
      assetCount: 6,
      isActive: true
    },
    {
      id: "7",
      name: "SAFETY EQUIPMENT",
      description: "Fire extinguishers, first aid kits, and safety devices",
      assetCount: 20,
      isActive: true
    },
    {
      id: "8",
      name: "SOFTWARE",
      description: "Licensed software and digital assets",
      assetCount: 67,
      isActive: true
    },
    {
      id: "9",
      name: "SMART LIGHTING",
      description: "Hubs, smart bulbs, and lighting control systems",
      assetCount: 2,
      isActive: true
    },
    {
      id: "10",
      name: "SMOKE ALARMS",
      description: "Smart and traditional smoke and CO sensors",
      assetCount: 1,
      isActive: true
    },
    {
      id: "11",
      name: "APPLIANCES",
      description: "Office kitchen equipment and industrial machinery",
      assetCount: 1,
      isActive: true
    },
    {
      id: "12",
      name: "ELECTRONICS",
      description: "General electronic equipment and displays",
      assetCount: 1,
      isActive: true
    }
  ],

  locations: [
    {
      id: "1",
      name: "IT Storage Room",
      description: "Secure storage room for IT equipment and devices",
      site: "Main Office",
      floor: "Ground Floor",
      room: "Room 101",
      assetCount: 8,
      isActive: true
    },
    {
      id: "2",
      name: "Storage Room",
      description: "General storage area for office supplies and furniture",
      site: "Main Office",
      floor: "Basement",
      room: "Room B01",
      assetCount: 3,
      isActive: true
    },
    {
      id: "3",
      name: "Parking Garage",
      description: "Underground parking facility for company vehicles",
      site: "Main Office",
      floor: "Basement",
      room: "Garage Level 1",
      assetCount: 1,
      isActive: true
    },
    {
      id: "4",
      name: "Conference Room",
      description: "Meeting room equipped with presentation equipment",
      site: "Main Office",
      floor: "2nd Floor",
      room: "Room 201",
      assetCount: 3,
      isActive: true
    },
    {
      id: "5",
      name: "Office Floor 2",
      description: "Second floor office space with workstations",
      site: "Main Office",
      floor: "2nd Floor",
      room: "Open Office",
      assetCount: 1,
      isActive: true
    },
    {
      id: "6",
      name: "Office Floor 1",
      description: "First floor office space with workstations",
      site: "Main Office",
      floor: "1st Floor",
      room: "Open Office",
      assetCount: 2,
      isActive: true
    },
    {
      id: "7",
      name: "Main Entrance",
      description: "Building main entrance and reception area",
      site: "Main Office",
      floor: "Ground Floor",
      room: "Lobby",
      assetCount: 1,
      isActive: true
    },
    {
      id: "8",
      name: "Server Room",
      description: "Climate-controlled room housing IT servers and equipment",
      site: "Main Office",
      floor: "Basement",
      room: "Room B02",
      assetCount: 2,
      isActive: true
    },
    {
      id: "9",
      name: "Break Room",
      description: "Employee break area with kitchen facilities",
      site: "Main Office",
      floor: "1st Floor",
      room: "Room 102",
      assetCount: 1,
      isActive: true
    }
  ],

  sites: [
    {
      id: "1",
      name: "Main Office",
      description: "Primary company headquarters",
      address: "123 Business Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      assetCount: 25,
      isActive: true
    },
    {
      id: "2",
      name: "Branch Office",
      description: "Secondary office location",
      address: "456 Commerce Avenue",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA",
      assetCount: 15,
      isActive: true
    },
    {
      id: "3",
      name: "Warehouse",
      description: "Storage and distribution facility",
      address: "789 Industrial Blvd",
      city: "Detroit",
      state: "MI",
      zipCode: "48201",
      country: "USA",
      assetCount: 8,
      isActive: true
    }
  ],

  departments: [
    {
      id: "1",
      name: "IT",
      description: "Information Technology Department",
      manager: "John Smith",
      budget: 500000,
      assetCount: 45,
      isActive: true
    },
    {
      id: "2",
      name: "Operations",
      description: "Operations and Facilities Management",
      manager: "Sarah Johnson",
      budget: 300000,
      assetCount: 23,
      isActive: true
    },
    {
      id: "3",
      name: "Sales",
      description: "Sales and Marketing Department",
      manager: "Mike Davis",
      budget: 200000,
      assetCount: 8,
      isActive: true
    },
    {
      id: "4",
      name: "Administration",
      description: "Administrative Services",
      manager: "Lisa Wilson",
      budget: 150000,
      assetCount: 12,
      isActive: true
    },
    {
      id: "5",
      name: "Security",
      description: "Security and Safety Department",
      manager: "Robert Brown",
      budget: 100000,
      assetCount: 15,
      isActive: true
    },
    {
      id: "6",
      name: "Facilities",
      description: "Facilities and Maintenance",
      manager: "David Miller",
      budget: 250000,
      assetCount: 6,
      isActive: true
    },
    {
      id: "7",
      name: "Safety",
      description: "Safety and Compliance",
      manager: "Jennifer Taylor",
      budget: 80000,
      assetCount: 20,
      isActive: true
    }
  ],

  employees: [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@company.com",
      department: "IT",
      position: "IT Manager",
      phone: "(555) 123-4567",
      employeeId: "EMP001",
      isActive: true
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      department: "IT",
      position: "Software Developer",
      phone: "(555) 234-5678",
      employeeId: "EMP002",
      isActive: true
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      department: "Sales",
      position: "Sales Manager",
      phone: "(555) 345-6789",
      employeeId: "EMP003",
      isActive: true
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      department: "Operations",
      position: "Operations Manager",
      phone: "(555) 456-7890",
      employeeId: "EMP004",
      isActive: true
    },
    {
      id: "5",
      name: "David Brown",
      email: "david.brown@company.com",
      department: "Administration",
      position: "Office Manager",
      phone: "(555) 567-8901",
      employeeId: "EMP005",
      isActive: true
    },
    {
      id: "6",
      name: "Lisa Davis",
      email: "lisa.davis@company.com",
      department: "IT",
      position: "System Administrator",
      phone: "(555) 678-9012",
      employeeId: "EMP006",
      isActive: true
    },
    {
      id: "7",
      name: "Robert Miller",
      email: "robert.miller@company.com",
      department: "Security",
      position: "Security Manager",
      phone: "(555) 789-0123",
      employeeId: "EMP007",
      isActive: true
    },
    {
      id: "8",
      name: "Jennifer Taylor",
      email: "jennifer.taylor@company.com",
      department: "Safety",
      position: "Safety Coordinator",
      phone: "(555) 890-1234",
      employeeId: "EMP008",
      isActive: true
    }
  ],

  manufacturers: [
    {
      id: "1",
      name: "Apple Inc.",
      website: "https://apple.com",
      contactEmail: "support@apple.com",
      assetCount: 12,
      isActive: true
    },
    {
      id: "2",
      name: "Dell Technologies",
      website: "https://dell.com",
      contactEmail: "support@dell.com",
      assetCount: 8,
      isActive: true
    },
    {
      id: "3",
      name: "HP Inc.",
      website: "https://hp.com",
      contactEmail: "support@hp.com",
      assetCount: 6,
      isActive: true
    },
    {
      id: "4",
      name: "Toyota Motor Corporation",
      website: "https://toyota.com",
      contactEmail: "support@toyota.com",
      assetCount: 1,
      isActive: true
    },
    {
      id: "5",
      name: "OfficeMax",
      website: "https://officemax.com",
      contactEmail: "support@officemax.com",
      assetCount: 3,
      isActive: true
    },
    {
      id: "6",
      name: "Epson America",
      website: "https://epson.com",
      contactEmail: "support@epson.com",
      assetCount: 2,
      isActive: true
    },
    {
      id: "7",
      name: "SecurityPro",
      website: "https://securitypro.com",
      contactEmail: "support@securitypro.com",
      assetCount: 1,
      isActive: true
    },
    {
      id: "8",
      name: "CoolAir Systems",
      website: "https://coolair.com",
      contactEmail: "support@coolair.com",
      assetCount: 1,
      isActive: true
    }
  ],

  conditions: [
    {
      id: "1",
      name: "Excellent",
      description: "Like new condition",
      color: "green",
      isActive: true
    },
    {
      id: "2",
      name: "Good",
      description: "Minor wear, fully functional",
      color: "blue",
      isActive: true
    },
    {
      id: "3",
      name: "Fair",
      description: "Some wear, needs minor maintenance",
      color: "yellow",
      isActive: true
    },
    {
      id: "4",
      name: "Poor",
      description: "Significant wear, needs repair",
      color: "orange",
      isActive: true
    },
    {
      id: "5",
      name: "Damaged",
      description: "Non-functional, needs major repair",
      color: "red",
      isActive: true
    }
  ],

  statuses: [
    {
      id: "1",
      name: "Available",
      description: "Asset is available for assignment",
      color: "green",
      isActive: true
    },
    {
      id: "2",
      name: "Check Out",
      description: "Asset is currently assigned and in use",
      color: "blue",
      isActive: true
    },
    {
      id: "3",
      name: "Move",
      description: "Asset is being moved or transferred",
      color: "orange",
      isActive: true
    },
    {
      id: "4",
      name: "Reserve",
      description: "Asset is reserved for future use",
      color: "purple",
      isActive: true
    },
    {
      id: "6",
      name: "Dispose",
      description: "Asset has been disposed of",
      color: "red",
      isActive: true
    },
    {
      id: "7",
      name: "Maintenance",
      description: "Asset is under maintenance",
      color: "yellow",
      isActive: true
    }
  ],
  customers: [
    {
      id: "1",
      name: "ABC Corporation",
      type: "Corporate",
      email: "leasing@abccorp.com",
      phone: "+1-555-0101",
      address: "123 Business Ave, Corporate City, CC 12345",
      contactPerson: "John Smith",
      isActive: true
    },
    {
      id: "2",
      name: "TechStart Solutions",
      type: "Corporate",
      email: "admin@techstart.com",
      phone: "+1-555-0102",
      address: "456 Innovation Drive, Tech Park, TP 67890",
      contactPerson: "Sarah Johnson",
      isActive: true
    },
    {
      id: "3",
      name: "Global Industries Ltd",
      type: "Corporate",
      email: "operations@globalind.com",
      phone: "+1-555-0103",
      address: "789 Enterprise Blvd, Industrial Zone, IZ 11111",
      contactPerson: "Mike Wilson",
      isActive: true
    },
    {
      id: "4",
      name: "Jane Doe",
      type: "Individual",
      email: "jane.doe@email.com",
      phone: "+1-555-0104",
      address: "321 Personal St, Residential Area, RA 22222",
      isActive: true
    },
    {
      id: "5",
      name: "Robert Chen",
      type: "Individual",
      email: "robert.chen@email.com",
      phone: "+1-555-0105",
      address: "654 Home Ave, Suburban District, SD 33333",
      isActive: true
    }
  ]
}

// Setup Data Manager Class
export class SetupDataManager {
  private static instance: SetupDataManager
  private setupData: SetupData

  private constructor() {
    this.setupData = this.loadSetupData()
  }

  public static getInstance(): SetupDataManager {
    if (!SetupDataManager.instance) {
      SetupDataManager.instance = new SetupDataManager()
    }
    return SetupDataManager.instance
  }

  private loadSetupData(): SetupData {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('setup-data')
      if (stored) {
        try {
          const parsedData = JSON.parse(stored)
          // Ensure all required properties exist (migration for existing data)
          return this.migrateSetupData(parsedData)
        } catch (error) {
          console.error('Error parsing setup data:', error)
        }
      }
    }
    return DEFAULT_SETUP_DATA
  }

  private migrateSetupData(data: any): SetupData {
    // Ensure all required properties exist with default values
    const migratedData = {
      ...DEFAULT_SETUP_DATA,
      ...data,
      // Ensure customers array exists
      customers: data.customers || DEFAULT_SETUP_DATA.customers
    }
    return migratedData
  }

  private saveSetupData(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('setup-data', JSON.stringify(this.setupData))
    }
  }

  // Categories
  public getCategories(): Category[] {
    return this.setupData.categories.filter(cat => cat.isActive)
  }

  public addCategory(category: Omit<Category, 'id' | 'assetCount'>): Category {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      assetCount: 0
    }
    this.setupData.categories.push(newCategory)
    this.saveSetupData()
    return newCategory
  }

  public updateCategory(id: string, updates: Partial<Category>): boolean {
    const index = this.setupData.categories.findIndex(cat => cat.id === id)
    if (index !== -1) {
      this.setupData.categories[index] = { ...this.setupData.categories[index], ...updates }
      this.saveSetupData()
      return true
    }
    return false
  }

  public deleteCategory(id: string): boolean {
    const index = this.setupData.categories.findIndex(cat => cat.id === id)
    if (index !== -1) {
      this.setupData.categories.splice(index, 1)
      this.saveSetupData()
      return true
    }
    return false
  }

  // Locations
  public getLocations(): Location[] {
    return this.setupData.locations.filter(loc => loc.isActive)
  }

  public addLocation(location: Omit<Location, 'id' | 'assetCount'>): Location {
    const newLocation: Location = {
      ...location,
      id: Date.now().toString(),
      assetCount: 0
    }
    this.setupData.locations.push(newLocation)
    this.saveSetupData()
    return newLocation
  }

  public updateLocation(id: string, updates: Partial<Location>): boolean {
    const index = this.setupData.locations.findIndex(loc => loc.id === id)
    if (index !== -1) {
      this.setupData.locations[index] = { ...this.setupData.locations[index], ...updates }
      this.saveSetupData()
      return true
    }
    return false
  }

  public deleteLocation(id: string): boolean {
    const index = this.setupData.locations.findIndex(loc => loc.id === id)
    if (index !== -1) {
      this.setupData.locations.splice(index, 1)
      this.saveSetupData()
      return true
    }
    return false
  }

  // Sites
  public getSites(): Site[] {
    return this.setupData.sites.filter(site => site.isActive)
  }

  public addSite(site: Omit<Site, 'id' | 'assetCount'>): Site {
    const newSite: Site = {
      ...site,
      id: Date.now().toString(),
      assetCount: 0
    }
    this.setupData.sites.push(newSite)
    this.saveSetupData()
    return newSite
  }

  public updateSite(id: string, updates: Partial<Site>): boolean {
    const index = this.setupData.sites.findIndex(site => site.id === id)
    if (index !== -1) {
      this.setupData.sites[index] = { ...this.setupData.sites[index], ...updates }
      this.saveSetupData()
      return true
    }
    return false
  }

  public deleteSite(id: string): boolean {
    const index = this.setupData.sites.findIndex(site => site.id === id)
    if (index !== -1) {
      this.setupData.sites.splice(index, 1)
      this.saveSetupData()
      return true
    }
    return false
  }

  // Departments
  public getDepartments(): Department[] {
    return this.setupData.departments.filter(dept => dept.isActive)
  }

  public addDepartment(department: Omit<Department, 'id' | 'assetCount'>): Department {
    const newDepartment: Department = {
      ...department,
      id: Date.now().toString(),
      assetCount: 0
    }
    this.setupData.departments.push(newDepartment)
    this.saveSetupData()
    return newDepartment
  }

  public updateDepartment(id: string, updates: Partial<Department>): boolean {
    const index = this.setupData.departments.findIndex(dept => dept.id === id)
    if (index !== -1) {
      this.setupData.departments[index] = { ...this.setupData.departments[index], ...updates }
      this.saveSetupData()
      return true
    }
    return false
  }

  public deleteDepartment(id: string): boolean {
    const index = this.setupData.departments.findIndex(dept => dept.id === id)
    if (index !== -1) {
      this.setupData.departments.splice(index, 1)
      this.saveSetupData()
      return true
    }
    return false
  }

  // Employees
  public getEmployees(): Employee[] {
    return this.setupData.employees.filter(emp => emp.isActive)
  }

  public addEmployee(employee: Omit<Employee, 'id'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString()
    }
    this.setupData.employees.push(newEmployee)
    this.saveSetupData()
    return newEmployee
  }

  public updateEmployee(id: string, updates: Partial<Employee>): boolean {
    const index = this.setupData.employees.findIndex(emp => emp.id === id)
    if (index !== -1) {
      this.setupData.employees[index] = { ...this.setupData.employees[index], ...updates }
      this.saveSetupData()
      return true
    }
    return false
  }

  public deleteEmployee(id: string): boolean {
    const index = this.setupData.employees.findIndex(emp => emp.id === id)
    if (index !== -1) {
      this.setupData.employees.splice(index, 1)
      this.saveSetupData()
      return true
    }
    return false
  }

  // Customers
  public getCustomers(): Customer[] {
    if (!this.setupData.customers) {
      // If customers don't exist, initialize with default data
      this.setupData.customers = DEFAULT_SETUP_DATA.customers
      this.saveSetupData()
    }
    return this.setupData.customers.filter(customer => customer.isActive)
  }

  public addCustomer(customer: Omit<Customer, 'id'>): Customer {
    if (!this.setupData.customers) {
      this.setupData.customers = []
    }
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString()
    }
    this.setupData.customers.push(newCustomer)
    this.saveSetupData()
    return newCustomer
  }

  public updateCustomer(id: string, updates: Partial<Customer>): boolean {
    if (!this.setupData.customers) {
      return false
    }
    const index = this.setupData.customers.findIndex(customer => customer.id === id)
    if (index !== -1) {
      this.setupData.customers[index] = { ...this.setupData.customers[index], ...updates }
      this.saveSetupData()
      return true
    }
    return false
  }

  public deleteCustomer(id: string): boolean {
    if (!this.setupData.customers) {
      return false
    }
    const index = this.setupData.customers.findIndex(customer => customer.id === id)
    if (index !== -1) {
      this.setupData.customers.splice(index, 1)
      this.saveSetupData()
      return true
    }
    return false
  }

  // Manufacturers
  public getManufacturers(): Manufacturer[] {
    return this.setupData.manufacturers.filter(man => man.isActive)
  }

  public addManufacturer(manufacturer: Omit<Manufacturer, 'id' | 'assetCount'>): Manufacturer {
    const newManufacturer: Manufacturer = {
      ...manufacturer,
      id: Date.now().toString(),
      assetCount: 0
    }
    this.setupData.manufacturers.push(newManufacturer)
    this.saveSetupData()
    return newManufacturer
  }

  public updateManufacturer(id: string, updates: Partial<Manufacturer>): boolean {
    const index = this.setupData.manufacturers.findIndex(man => man.id === id)
    if (index !== -1) {
      this.setupData.manufacturers[index] = { ...this.setupData.manufacturers[index], ...updates }
      this.saveSetupData()
      return true
    }
    return false
  }

  public deleteManufacturer(id: string): boolean {
    const index = this.setupData.manufacturers.findIndex(man => man.id === id)
    if (index !== -1) {
      this.setupData.manufacturers.splice(index, 1)
      this.saveSetupData()
      return true
    }
    return false
  }

  // Conditions
  public getConditions(): Condition[] {
    return this.setupData.conditions.filter(cond => cond.isActive)
  }

  // Statuses
  public getStatuses(): Status[] {
    return this.setupData.statuses.filter(status => status.isActive)
  }

  // Utility methods
  public getAllSetupData(): SetupData {
    return this.setupData
  }

  public resetToDefault(): void {
    this.setupData = DEFAULT_SETUP_DATA
    this.saveSetupData()
  }

  public exportSetupData(): string {
    return JSON.stringify(this.setupData, null, 2)
  }

  public importSetupData(data: string): boolean {
    try {
      const parsedData = JSON.parse(data)
      this.setupData = parsedData
      this.saveSetupData()
      return true
    } catch (error) {
      console.error('Error importing setup data:', error)
      return false
    }
  }
}

// Export singleton instance
export const setupDataManager = SetupDataManager.getInstance()



