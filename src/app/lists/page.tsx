import { redirect } from "next/navigation"

// The Lists section has been removed. Redirect to Assets.
export default function ListsPage() {
  redirect("/assets")
}
