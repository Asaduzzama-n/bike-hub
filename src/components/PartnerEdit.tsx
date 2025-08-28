"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, X } from "lucide-react";

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

interface PartnerEditFormData {
  name: string;
  email: string;
  phone: string;
  nid: string;
  address: string;
  totalInvestment: string;
  totalReturns: string;
  activeInvestments: string;
  pendingPayout: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface PartnerEditProps {
  partner: Partner | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (partnerId: string, updatedData: Partial<Partner>) => Promise<void>;
}

const initialFormData: PartnerEditFormData = {
  name: '',
  email: '',
  phone: '',
  nid: '',
  address: '',
  totalInvestment: '',
  totalReturns: '',
  activeInvestments: '',
  pendingPayout: '',
  status: 'active',
};

export default function PartnerEdit({ partner, isOpen, onClose, onSave }: PartnerEditProps) {
  const [formData, setFormData] = useState<PartnerEditFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PartnerEditFormData>>({});

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        email: partner.email || '',
        phone: partner.phone || '',
        nid: partner.nid || '',
        address: partner.address || '',
        totalInvestment: partner.totalInvestment?.toString() || '',
        totalReturns: partner.totalReturns?.toString() || '',
        activeInvestments: partner.activeInvestments?.toString() || '',
        pendingPayout: partner.pendingPayout?.toString() || '',
        status: partner.status || 'active',
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [partner]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PartnerEditFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    // Financial fields are read-only, no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partner?._id || !validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const updatedData: Partial<Partner> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        nid: formData.nid || undefined,
        address: formData.address || undefined,
        status: formData.status,
        updatedAt: new Date(),
      };

      await onSave(partner._id, updatedData);
      onClose();
    } catch (error) {
      console.error('Error updating partner:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PartnerEditFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!partner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Partner</span>
            <Badge variant="outline">{partner.status}</Badge>
          </DialogTitle>
          <DialogDescription>
            Update partner information and investment details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nid">National ID</Label>
                <Input
                  id="nid"
                  value={formData.nid}
                  onChange={(e) => handleInputChange('nid', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Financial Information - Read Only */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-muted-foreground">Financial Information (Read Only)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  ৳{formData.totalInvestment ? Number(formData.totalInvestment).toLocaleString() : '0'}
                </p>
                <p className="text-sm text-muted-foreground">Total Investment</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  ৳{formData.totalReturns ? Number(formData.totalReturns).toLocaleString() : '0'}
                </p>
                <p className="text-sm text-muted-foreground">Total Returns</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  ৳{formData.pendingPayout ? Number(formData.pendingPayout).toLocaleString() : '0'}
                </p>
                <p className="text-sm text-muted-foreground">Pending Payout</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {formData.activeInvestments || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Active Investments</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <strong>Note:</strong> Financial information cannot be edited here. Please contact system administrator for financial updates.
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'suspended') => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}