"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Edit,
  AlertCircle,
} from "lucide-react";
import PartnerView from "@/components/PartnerView";
import PartnerEdit from "@/components/PartnerEdit";

interface Partner {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  nid?: string;
  address?: string;
  totalInvestment?: number;
  totalReturns?: number;
  activeInvestments?: number;
  pendingPayout: number;
  roi?: number;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

interface PartnerFormData {
  name: string;
  email: string;
  phone: string;
  nid: string;
  address: string;
}

interface PartnerFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  nid?: string;
  address?: string;
}

const initialPartnerForm: PartnerFormData = {
  name: "",
  email: "",
  phone: "",
  nid: "",
  address: "",
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
}

function StatCard({ title, value, icon: Icon, prefix = "" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PartnerManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [partnersError, setPartnersError] = useState<string | null>(null);
  const [partnerForm, setPartnerForm] = useState<PartnerFormData>(initialPartnerForm);
  const [partnerFormErrors, setPartnerFormErrors] = useState<PartnerFormErrors>({});
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isPartnerViewOpen, setIsPartnerViewOpen] = useState(false);
  const [isPartnerEditOpen, setIsPartnerEditOpen] = useState(false);


  // Fetch partners from API
  const fetchPartners = async () => {
    try {
      setPartnersLoading(true);
      setPartnersError(null);
      const response = await fetch('/api/admin/partners');
      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }
      const data = await response.json();
      setPartners(data.data?.partners || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setPartnersError('Failed to load partners. Please try again.');
      toast.error("Failed to load partners. Please try again.");
    } finally {
      setPartnersLoading(false);
    }
  };

  // Create new partner
  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPartnerFormErrors({});

    // Client-side validation
    const errors: PartnerFormErrors = {};
    if (!partnerForm.name.trim()) errors.name = "Name is required";
    if (!partnerForm.email.trim()) errors.email = "Email is required";
    if (!partnerForm.phone.trim()) errors.phone = "Phone is required";

    if (Object.keys(errors).length > 0) {
      setPartnerFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partnerForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.errors) {
          // Handle validation errors
          setPartnerFormErrors(errorData.errors);
          toast.error("Please check the form for errors.");
        } else {
          throw new Error(errorData.message || 'Failed to create partner');
        }
        return;
      }

      const result = await response.json();
      setPartnerForm(initialPartnerForm);
      setIsAddPartnerOpen(false);
      toast.success("Partner created successfully.");
      fetchPartners(); // Refresh the list
    } catch (error) {
      console.error('Error creating partner:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create partner. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update partner
  const handleUpdatePartner = async (partnerId: string, updatedData: Partial<Partner>) => {
    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.errors) {
          // Handle validation errors
          const errorMessages = Object.values(errorData.errors).join(', ');
          toast.error(errorMessages);
        } else {
          throw new Error(errorData.message || 'Failed to update partner');
        }
        return;
      }

      toast.success("Partner updated successfully.");
      fetchPartners(); // Refresh the list
    } catch (error) {
      console.error('Error updating partner:', error);
      toast.error(error instanceof Error ? error.message : "Failed to update partner. Please try again.");
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const totalPartners = partners.length;
  const totalInvestments = partners.reduce((acc, p) => acc + (p?.totalInvestment || 0), 0);
  const totalReturns = partners.reduce((acc, p) => acc + (p?.totalReturns || 0), 0);
  const totalPendingPayouts = partners.reduce((acc, p) => acc + (p?.pendingPayout || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Partner Management</h2>
          <p className="text-muted-foreground">Manage business partners and their investments</p>
        </div>
        <Dialog open={isAddPartnerOpen} onOpenChange={setIsAddPartnerOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Partner</DialogTitle>
              <DialogDescription>
                Add a new business partner to the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                  className={partnerFormErrors.name ? "border-red-500" : ""}
                  required
                />
                {partnerFormErrors.name && (
                  <p className="text-sm text-red-500">{partnerFormErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={partnerForm.email}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, email: e.target.value }))}
                  className={partnerFormErrors.email ? "border-red-500" : ""}
                  required
                />
                {partnerFormErrors.email && (
                  <p className="text-sm text-red-500">{partnerFormErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, phone: e.target.value }))}
                  className={partnerFormErrors.phone ? "border-red-500" : ""}
                  required
                />
                {partnerFormErrors.phone && (
                  <p className="text-sm text-red-500">{partnerFormErrors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nid">National ID (Optional)</Label>
                <Input
                  id="nid"
                  type="text"
                  value={partnerForm.nid}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, nid: e.target.value }))}
                  className={partnerFormErrors.nid ? "border-red-500" : ""}
                />
                {partnerFormErrors.nid && (
                  <p className="text-sm text-red-500">{partnerFormErrors.nid}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Textarea
                  id="address"
                  value={partnerForm.address}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, address: e.target.value }))}
                  className={partnerFormErrors.address ? "border-red-500" : ""}
                  rows={3}
                />
                {partnerFormErrors.address && (
                  <p className="text-sm text-red-500">{partnerFormErrors.address}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddPartnerOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Partner'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Partner Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Partners"
          value={totalPartners}
          icon={Users}
        />
        <StatCard
          title="Total Investments"
          value={totalInvestments}
          icon={DollarSign}
          prefix="৳"
        />
        <StatCard
          title="Total Returns"
          value={totalReturns}
          icon={TrendingUp}
          prefix="৳"
        />
        <StatCard
          title="Pending Payouts"
          value={totalPendingPayouts}
          icon={DollarSign}
          prefix="৳"
        />
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
          <CardDescription>Manage your business partners</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Investment</TableHead>
                <TableHead>Returns</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnersLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading partners...
                  </TableCell>
                </TableRow>
              ) : partnersError ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                      <p className="text-red-500">{partnersError}</p>
                      <Button onClick={fetchPartners} variant="outline" size="sm">
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : partners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No partners found. Add your first partner to get started.
                  </TableCell>
                </TableRow>
              ) : (
                partners.map((partner) => (
                  <TableRow key={partner._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{partner.name}</div>
                        <div className="text-sm text-muted-foreground">{partner.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{partner.phone}</div>
                    </TableCell>
                    <TableCell>৳{(partner.totalInvestment || 0).toLocaleString()}</TableCell>
                    <TableCell>৳{(partner.totalReturns || 0).toLocaleString()}</TableCell>
                    <TableCell>{partner.activeInvestments || 0}</TableCell>
                    <TableCell>৳{(partner.pendingPayout || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                        {partner.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPartner(partner);
                            setIsPartnerViewOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPartner(partner);
                            setIsPartnerEditOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Partner View Dialog */}
      {selectedPartner && (
        <PartnerView
          partner={selectedPartner}
          isOpen={isPartnerViewOpen}
          onClose={() => {
            setIsPartnerViewOpen(false);
            setSelectedPartner(null);
          }}
        />
      )}

      {/* Partner Edit Dialog */}
      {selectedPartner && (
        <PartnerEdit
          partner={selectedPartner}
          isOpen={isPartnerEditOpen}
          onClose={() => {
            setIsPartnerEditOpen(false);
            setSelectedPartner(null);
          }}
          onSave={async (partnerId: string, updatedData: Partial<Partner>) => {
            if (selectedPartner._id) {
              handleUpdatePartner(selectedPartner._id, updatedData);
            }
          }}
        />
      )}
    </div>
  );
}