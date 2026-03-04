"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus, UserCheck, UserMinus, Move, Package } from "lucide-react"
import Link from "next/link"

export function QuickActionsWidget() {
  return (
    <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common asset management tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild className="h-auto p-3 flex flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-950/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200">
              <Link href="/assets/add">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-green-900 dark:text-green-100">Add Asset</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="h-auto p-3 flex flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
              <Link href="/assets/checkout">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-blue-900 dark:text-blue-100">Check Out</span>
              </Link>
            </Button>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild className="h-auto p-3 flex flex-col gap-2 hover:bg-orange-50 dark:hover:bg-orange-950/20 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200">
              <Link href="/assets/checkin">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                  <UserMinus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-xs font-medium text-orange-900 dark:text-orange-100">Check In</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="h-auto p-3 flex flex-col gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
              <Link href="/assets/move">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                  <Move className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs font-medium text-purple-900 dark:text-purple-100">Move Asset</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
