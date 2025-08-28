"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Edit,
} from "lucide-react";
import Image from "next/image";

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

interface PartnerViewProps {
  partner: Partner | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (partner: Partner) => void;
}

export default function PartnerView({ partner, isOpen, onClose, onEdit }: PartnerViewProps) {
  if (!partner) return null;

  const roi = partner.totalInvestment && partner.totalReturns 
    ? ((partner.totalReturns / partner.totalInvestment) * 100).toFixed(1)
    : '0.0';

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{partner.name}</DialogTitle>
              <DialogDescription>
                Partner details and investment information
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              {partner.status && (
                <Badge className={getStatusColor(partner.status)}>
                  {partner.status}
                </Badge>
              )}
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(partner)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{partner.phone}</p>
                  </div>
                </div>
                {partner.nid && (
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">National ID</p>
                      <Image
                        src={partner.nid}
                        alt="National ID"
                        width={200}
                        height={200}
                        className="h-12 w-12 rounded-md"
                      />
                    </div>
                  </div>
                )}
                {partner.address && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{partner.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    ৳{partner.totalInvestment?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ৳{partner.totalReturns?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Returns</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    ৳{partner.pendingPayout?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Payout</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className={`text-2xl font-bold ${
                    parseFloat(roi) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {roi}%
                  </p>
                  <p className="text-sm text-muted-foreground">ROI</p>
                </div>
              </div>
              
              {partner.activeInvestments !== undefined && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Investments</span>
                    <span className="text-lg font-bold">{partner.activeInvestments}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Joined</span>
                  <span>{new Date(partner.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{new Date(partner.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}