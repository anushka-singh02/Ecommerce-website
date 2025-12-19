"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import { useAuthStore } from "@/store/useAuthStore"
import { userService } from "@/lib/api/user"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  User, Package, MapPin, Heart, Settings, LogOut,
  ShoppingBag, ShoppingCart, Trash2, Loader2, Plus, X,
  Phone, Briefcase, Calendar, CreditCard, ExternalLink, Banknote
} from "lucide-react"

// --- TYPES ---
interface Order {
  id: string
  createdAt: string
  total?: number
  totalAmount?: number
  paymentStatus: string
  orderStatus: string
  paymentMethod?: string // ✅ Added
  shippingAddress?: any // ✅ Added
  items: Array<{
    id: string
    quantity: number // ✅ Added
    price: number // ✅ Added
    product: {
      name: string
      images: string[]
    }
  }>
}

interface Address {
  id: string
  name: string
  phone: string
  tag: string
  street: string
  city: string
  state: string
  zip: string
  isDefault: boolean
}

interface WishlistItem {
  productId: string
  name: string
  price: number
  image: string
}

// SAFETY HELPER
const formatPrice = (value: any) => {
  if (value === null || value === undefined) return "0.00";
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

export default function ProfilePage() {
  const router = useRouter()
  const { user, login, logout, isAuthenticated, isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState("overview")

  // Data State
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  // Address Form State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    tag: "HOME",
    street: "",
    city: "",
    state: "",
    zip: ""
  })

  // ✅ ORDER DETAILS MODAL STATE
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

  const [cartCount, setCartCount] = useState(0)

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: ""
  })

  // --- AUTH GUARD ---
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // --- FETCH DATA ---
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        setDataLoading(true)
        try {
          const [ordersData, wishlistData, addressesData, cartData] = await Promise.all([
            userService.getOrders().catch(() => []),
            userService.getWishlist().catch(() => []),
            userService.getAddresses().catch(() => []),
            userService.getCart().catch(() => null)
          ])

          setOrders(ordersData as Order[])
          setWishlist(wishlistData as WishlistItem[])
          setAddresses(addressesData as Address[])

          // @ts-ignore
          const currentItems = cartData?.items || []
          // @ts-ignore
          const totalQuantity = currentItems.reduce((acc, item) => acc + item.quantity, 0)
          setCartCount(totalQuantity)

        } catch (error) {
          console.error("Failed to load data", error)
        } finally {
          setDataLoading(false)
        }
      }
      fetchData()
    }
  }, [isAuthenticated])

  // --- HANDLERS ---
  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleUpdateProfile = async () => {
    try {
      const updatedUser = await userService.updateProfile(profileForm)
      login(updatedUser as any, localStorage.getItem('accessToken') || "")
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      await userService.deleteAddress(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
      toast.success("Address deleted")
    } catch (error) {
      toast.error("Failed to delete address")
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // @ts-ignore
      const newAddr = await userService.addAddress(addressForm) as Address;

      setAddresses(prev => [...prev, newAddr]);
      setIsAddressModalOpen(false);
      setAddressForm({ name: "", phone: "", tag: "HOME", street: "", city: "", state: "", zip: "" });
      toast.success("Address added successfully");
    } catch (error) {
      toast.error("Failed to add address");
    }
  }

  const handleRemoveFromWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await userService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.productId !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // ✅ NEW: Handle View Order Click
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  }

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* --- SIDEBAR --- */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <h2 className="text-xl font-bold mb-4 px-2 md:px-0">My Account</h2>
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full" orientation="vertical">
              <TabsList className="flex md:flex-col h-auto bg-transparent gap-2 p-0 w-full overflow-x-auto md:overflow-visible justify-start">
                {['overview', 'orders', 'wishlist', 'addresses', 'settings'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="capitalize w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border"
                  >
                    {tab === 'overview' && <User className="h-4 w-4" />}
                    {tab === 'orders' && <Package className="h-4 w-4" />}
                    {tab === 'wishlist' && <Heart className="h-4 w-4" />}
                    {tab === 'addresses' && <MapPin className="h-4 w-4" />}
                    {tab === 'settings' && <Settings className="h-4 w-4" />}
                    {tab}
                  </TabsTrigger>
                ))}
                <Button variant="ghost" className="w-full justify-start gap-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 mt-4 md:mt-auto" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Log Out
                </Button>
              </TabsList>
            </Tabs>
          </aside>

          {/* --- CONTENT --- */}
          <div className="flex-1 min-h-[500px]">
            <Tabs value={activeTab} className="w-full">

              {/* 1. OVERVIEW */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                <h1 className="text-3xl font-bold mb-6">Hello, {user?.name?.split(' ')[0]}</h1>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{orders.length}</div>
                      <p className="text-xs text-muted-foreground">Lifetime orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{wishlist.length}</div>
                      <p className="text-xs text-muted-foreground">Saved items</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Items in Cart</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{cartCount}</div>
                      <p className="text-xs text-muted-foreground">Ready to checkout</p>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" defaultValue={user?.email} disabled className="bg-muted" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleUpdateProfile}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* 2. ORDERS */}
              <TabsContent value="orders" className="space-y-6 mt-0">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Order History</h2>
                  <p className="text-muted-foreground mb-6">Track and manage your recent orders.</p>
                </div>
                {dataLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">You haven't placed any orders yet.</div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const mainItem = order.items?.[0]?.product;
                      const safeTotal = formatPrice(order.total ?? order.totalAmount);
                      const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date unavailable';
                      return (
                        <div key={order.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 border rounded-xl hover:border-black/20 transition-all bg-white shadow-sm">
                          <div className="relative h-24 w-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border">
                            {mainItem?.images?.[0] ? (
                              <Image src={mainItem.images[0]} alt={mainItem.name || "Product"} fill className="object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">{mainItem?.name || "Order Item"}</h3>
                                {order.items && order.items.length > 1 && (
                                  <p className="text-sm text-muted-foreground"> + {order.items.length - 1} other items </p>
                                )}
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${(order.orderStatus || "").toUpperCase() === "DELIVERED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                }`}> {(order.orderStatus || "Pending").toLowerCase()} </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span>Order <span className="font-medium text-black">#{order.id.slice(0, 8)}</span></span>
                              <span>•</span>
                              <span>{dateStr}</span>
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 gap-3">
                            <span className="font-bold text-xl">${safeTotal}</span>
                            {/* ✅ BUTTON NOW OPENS MODAL */}
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() => handleViewOrder(order)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              {/* 3. WISHLIST */}
              <TabsContent value="wishlist" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Wishlist</h2>
                  <span className="text-muted-foreground text-sm">{wishlist.length} items</span>
                </div>

                {dataLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                ) : wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-16 bg-white border border-dashed rounded-xl">
                    <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                      <Heart className="h-8 w-8 text-red-500 fill-red-500/20" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">Save items you love here so you can easily find them later.</p>
                    <Button onClick={() => router.push('/products')}>Explore Products</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <Link key={item.productId} href={`/product/${item.productId}`}>
                        <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all border-muted">
                          <div className="relative h-[200px] bg-gray-100">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                            )}
                            <button
                              onClick={(e) => handleRemoveFromWishlist(e, item.productId)}
                              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm text-red-500 hover:bg-red-50 transition-colors z-10"
                              title="Remove from wishlist"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium truncate text-base mb-1">{item.name}</h3>
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-lg">${formatPrice(item.price)}</p>
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">View</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* 4. ADDRESSES */}
              <TabsContent value="addresses" className="space-y-6 mt-0">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Saved Addresses</CardTitle>
                      <CardDescription>Manage your shipping details.</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setIsAddressModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add New
                    </Button>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border rounded-lg p-4 relative group bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute top-4 right-4 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteAddress(addr.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${addr.tag === "OFFICE" ? 'bg-blue-600 text-white' : 'bg-black text-white'}`}>
                            {addr.tag === "OFFICE" ? <Briefcase className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                            {addr.tag}
                          </span>
                          {addr.isDefault && <span className="px-2 py-1 bg-gray-100 text-xs rounded font-medium text-gray-600">Default</span>}
                        </div>
                        <div className="font-semibold text-lg">{addr.name}</div>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          <p>{addr.street}</p>
                          <p>{addr.city}, {addr.state} {addr.zip}</p>
                          <div className="flex items-center gap-2 mt-3 text-black font-medium">
                            <Phone className="h-3 w-3" />
                            <span>{addr.phone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors h-full min-h-[140px]" onClick={() => setIsAddressModalOpen(true)}>
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">Add New Address</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 5. SETTINGS */}
              <TabsContent value="settings" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                    <CardDescription>Manage your password and security preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-pass">Current Password</Label>
                      <Input id="current-pass" type="password" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* 1. ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsAddressModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="h-4 w-4" /></button>
            <CardHeader>
              <CardTitle>Add New Address</CardTitle>
              <CardDescription>Enter delivery details below.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="space-y-2">
                  <Label>Address Type</Label>
                  <div className="flex gap-4">
                    {['HOME', 'OFFICE', 'OTHER'].map((type) => (
                      <button key={type} type="button" onClick={() => setAddressForm({ ...addressForm, tag: type })} className={`flex-1 py-2 text-sm font-medium rounded-md border transition-all ${addressForm.tag === type ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>{type}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addr-name">Recipient Name</Label>
                    <Input id="addr-name" placeholder="John Doe" value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addr-phone">Phone Number</Label>
                    <Input id="addr-phone" placeholder="+1 (555) 000-0000" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" placeholder="123 Main St" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input id="zip" placeholder="ZIP" value={addressForm.zip} onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })} required />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-2">Save Address</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ✅ 2. ORDER DETAILS MODAL */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    Order #{selectedOrder.id.slice(0, 8)}

                    {/* 1. ORDER STATUS (Logistics) */}
                    <span
                      title="Order Status"
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${selectedOrder.orderStatus === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                          selectedOrder.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                      <Package className="h-3.5 w-3.5" />
                      {selectedOrder.orderStatus}
                    </span>

                    {/* 2. PAYMENT STATUS (Money) */}
                    <span
                      title="Payment Status"
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${selectedOrder.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          selectedOrder.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                            selectedOrder.paymentStatus === 'REFUNDED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                      <Banknote className="h-3.5 w-3.5" />
                      {selectedOrder.paymentStatus}
                    </span>

                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                  </CardDescription>
                </div>

                {/* Payment Method Badge (unchanged) */}
                {selectedOrder.paymentMethod && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-medium">{selectedOrder.paymentMethod}</span>
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-0 flex-1">
              <CardContent className="space-y-6 pt-6">

                {/* Product List */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Items Ordered</h3>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="relative h-16 w-16 bg-gray-100 rounded-md overflow-hidden border flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity || 1}</p>
                      </div>
                      <div className="font-semibold text-sm">
                        ${formatPrice((item.price || 0) * (item.quantity))}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Shipping Info */}
                {selectedOrder.shippingAddress && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Shipping Details</h3>
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-black">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                      <p className="text-muted-foreground">{selectedOrder.shippingAddress.address}</p>
                      <p className="text-muted-foreground">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p className="text-muted-foreground">{selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </div>

            <CardFooter className="border-t bg-gray-50 p-6">
              <div className="w-full space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${formatPrice(selectedOrder.total ?? selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${formatPrice(selectedOrder.total ?? selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}