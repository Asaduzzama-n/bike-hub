"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Upload,
  Search,
  AlertTriangle,
  User,
  Car,
  RefreshCw,
  ExternalLink,
  Filter,
  Calendar,
} from "lucide-react";
import Image from "next/image";

// Mock data - in real app this would come from API
const mockDocuments = [
  {
    id: "1",
    userId: "user-1",
    userName: "John Smith",
    userEmail: "john@example.com",
    type: "nid",
    documentNumber: "1234567890123",
    status: "pending",
    uploadDate: "2024-01-28",
    verificationDate: null,
    verifiedBy: null,
    frontImage: "/api/placeholder/400/250",
    backImage: "/api/placeholder/400/250",
    notes: "",
    rejectionReason: "",
    bikeId: "bike-1",
    bikeName: "Honda CBR 150R",
  },
  {
    id: "2",
    userId: "user-2",
    userName: "Sarah Johnson",
    userEmail: "sarah@example.com",
    type: "brta",
    documentNumber: "DHAKA-A-123456",
    status: "verified",
    uploadDate: "2024-01-25",
    verificationDate: "2024-01-26",
    verifiedBy: "admin",
    frontImage: "/api/placeholder/400/250",
    backImage: null,
    notes: "Valid registration document",
    rejectionReason: "",
    bikeId: "bike-2",
    bikeName: "Yamaha FZ-S",
  },
  {
    id: "3",
    userId: "user-3",
    userName: "Mike Wilson",
    userEmail: "mike@example.com",
    type: "nid",
    documentNumber: "9876543210987",
    status: "rejected",
    uploadDate: "2024-01-20",
    verificationDate: "2024-01-21",
    verifiedBy: "admin",
    frontImage: "/api/placeholder/400/250",
    backImage: "/api/placeholder/400/250",
    notes: "",
    rejectionReason: "Blurry image, unable to verify details",
    bikeId: "bike-3",
    bikeName: "Suzuki Gixxer",
  },
];

const mockStats = {
  totalDocuments: 156,
  pendingVerification: 23,
  verifiedToday: 8,
  rejectedToday: 2,
  averageVerificationTime: "2.5 hours",
};

interface DocumentFormData {
  status: string;
  notes: string;
  rejectionReason: string;
}

const initialDocumentForm: DocumentFormData = {
  status: "",
  notes: "",
  rejectionReason: "",
};

export default function AdminDocumentsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [documentForm, setDocumentForm] = useState<DocumentFormData>(initialDocumentForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [brtaVerificationId, setBrtaVerificationId] = useState("");
  const [brtaResult, setBrtaResult] = useState<any>(null);
  const [isBrtaLoading, setIsBrtaLoading] = useState(false);

  const handleVerifyDocument = async (documentId: string, action: 'approve' | 'reject') => {
    setIsLoading(true);
    try {
      // In real app, this would call API
      console.log(`${action} document:`, documentId, documentForm);
      setIsViewDialogOpen(false);
      setDocumentForm(initialDocumentForm);
    } catch (error) {
      console.error(`Error ${action}ing document:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrtaVerification = async () => {
    if (!brtaVerificationId.trim()) return;
    
    setIsBrtaLoading(true);
    try {
      // Mock BRTA API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBrtaResult({
        registrationNumber: brtaVerificationId,
        ownerName: "John Doe",
        vehicleClass: "Motorcycle",
        engineNumber: "ABC123456",
        chassisNumber: "XYZ789012",
        registrationDate: "2020-05-15",
        expiryDate: "2025-05-14",
        status: "Active",
        taxPaid: true,
        fitnessValid: true,
      });
    } catch (error) {
      console.error("BRTA verification error:", error);
    } finally {
      setIsBrtaLoading(false);
    }
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.documentNumber.includes(searchQuery) ||
                         doc.bikeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    const matchesType = filterType === "all" || doc.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, color = "blue" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Verification</h1>
          <p className="text-muted-foreground">Verify user documents and BRTA registrations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Documents"
          value={mockStats.totalDocuments}
          icon={FileText}
          description="All time submissions"
        />
        <StatCard
          title="Pending Review"
          value={mockStats.pendingVerification}
          icon={Clock}
          description="Awaiting verification"
          color="yellow"
        />
        <StatCard
          title="Verified Today"
          value={mockStats.verifiedToday}
          icon={CheckCircle}
          description="Approved documents"
          color="green"
        />
        <StatCard
          title="Rejected Today"
          value={mockStats.rejectedToday}
          icon={XCircle}
          description="Declined documents"
          color="red"
        />
        <StatCard
          title="Avg. Time"
          value={mockStats.averageVerificationTime}
          icon={RefreshCw}
          description="To verify documents"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="brta">BRTA Verification</TabsTrigger>
        </TabsList>

        {/* Pending Verification Tab */}
        <TabsContent value="pending" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, document number, or bike..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="nid">NID</SelectItem>
                <SelectItem value="brta">BRTA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Documents Awaiting Verification</CardTitle>
              <CardDescription>Review and verify user-submitted documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Document Number</TableHead>
                    <TableHead>Related Bike</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.filter(doc => doc.status === 'pending').map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{document.userName}</div>
                          <div className="text-sm text-muted-foreground">{document.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {document.type === 'nid' ? (
                            <><User className="w-3 h-3 mr-1" />NID</>
                          ) : (
                            <><Car className="w-3 h-3 mr-1" />BRTA</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{document.documentNumber}</TableCell>
                      <TableCell>{document.bikeName}</TableCell>
                      <TableCell>{new Date(document.uploadDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(document.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDocument(document);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Documents Tab */}
        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, document number, or bike..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="nid">NID</SelectItem>
                <SelectItem value="brta">BRTA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>Complete history of document submissions and verifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Document Number</TableHead>
                    <TableHead>Related Bike</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{document.userName}</div>
                          <div className="text-sm text-muted-foreground">{document.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {document.type === 'nid' ? (
                            <><User className="w-3 h-3 mr-1" />NID</>
                          ) : (
                            <><Car className="w-3 h-3 mr-1" />BRTA</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{document.documentNumber}</TableCell>
                      <TableCell>{document.bikeName}</TableCell>
                      <TableCell>{new Date(document.uploadDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(document.status)}</TableCell>
                      <TableCell>
                        {document.verifiedBy ? (
                          <span className="text-sm text-muted-foreground">{document.verifiedBy}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDocument(document);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BRTA Verification Tab */}
        <TabsContent value="brta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>BRTA Portal Integration</span>
              </CardTitle>
              <CardDescription>
                Verify vehicle registration directly with BRTA database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="brta-id">Registration Number</Label>
                  <Input
                    id="brta-id"
                    placeholder="Enter BRTA registration number (e.g., DHAKA-A-123456)"
                    value={brtaVerificationId}
                    onChange={(e) => setBrtaVerificationId(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleBrtaVerification}
                  disabled={isBrtaLoading || !brtaVerificationId.trim()}
                >
                  {isBrtaLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  {isBrtaLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>

              {brtaResult && (
                <div className="border rounded-lg p-6 bg-green-50">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">Verification Successful</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Registration Number</Label>
                      <p className="text-sm">{brtaResult.registrationNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Owner Name</Label>
                      <p className="text-sm">{brtaResult.ownerName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Vehicle Class</Label>
                      <p className="text-sm">{brtaResult.vehicleClass}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Engine Number</Label>
                      <p className="text-sm">{brtaResult.engineNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Chassis Number</Label>
                      <p className="text-sm">{brtaResult.chassisNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Registration Date</Label>
                      <p className="text-sm">{new Date(brtaResult.registrationDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Expiry Date</Label>
                      <p className="text-sm">{new Date(brtaResult.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className="bg-green-100 text-green-800">{brtaResult.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      {brtaResult.taxPaid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Tax Paid</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {brtaResult.fitnessValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Fitness Valid</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">BRTA Integration Status</h3>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Connected to BRTA Portal</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Real-time verification with Bangladesh Road Transport Authority database
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Review</DialogTitle>
            <DialogDescription>
              Review and verify the submitted document
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-6">
              {/* Document Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <p className="text-sm">{selectedDocument.userName}</p>
                  <p className="text-xs text-muted-foreground">{selectedDocument.userEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Document Type</Label>
                  <p className="text-sm">{selectedDocument.type.toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Document Number</Label>
                  <p className="text-sm font-mono">{selectedDocument.documentNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Related Bike</Label>
                  <p className="text-sm">{selectedDocument.bikeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Upload Date</Label>
                  <p className="text-sm">{new Date(selectedDocument.uploadDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  {getStatusBadge(selectedDocument.status)}
                </div>
              </div>

              {/* Document Images */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Document Images</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Front Side</p>
                    <div className="border rounded-lg overflow-hidden">
                      <Image
                        src={selectedDocument.frontImage}
                        alt="Document front"
                        width={400}
                        height={250}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  {selectedDocument.backImage && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Back Side</p>
                      <div className="border rounded-lg overflow-hidden">
                        <Image
                          src={selectedDocument.backImage}
                          alt="Document back"
                          width={400}
                          height={250}
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Form */}
              {selectedDocument.status === 'pending' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Verification Decision</Label>
                    <Select value={documentForm.status} onValueChange={(value) => setDocumentForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Approve</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Verification Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about the verification..."
                      value={documentForm.notes}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  {documentForm.status === 'rejected' && (
                    <div className="space-y-2">
                      <Label htmlFor="rejectionReason">Rejection Reason</Label>
                      <Textarea
                        id="rejectionReason"
                        placeholder="Explain why the document is being rejected..."
                        value={documentForm.rejectionReason}
                        onChange={(e) => setDocumentForm(prev => ({ ...prev, rejectionReason: e.target.value }))}
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Previous Notes/Rejection Reason */}
              {selectedDocument.status !== 'pending' && (
                <div className="space-y-2">
                  {selectedDocument.notes && (
                    <div>
                      <Label className="text-sm font-medium">Verification Notes</Label>
                      <p className="text-sm bg-gray-50 p-3 rounded">{selectedDocument.notes}</p>
                    </div>
                  )}
                  {selectedDocument.rejectionReason && (
                    <div>
                      <Label className="text-sm font-medium">Rejection Reason</Label>
                      <p className="text-sm bg-red-50 p-3 rounded text-red-800">{selectedDocument.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedDocument?.status === 'pending' && documentForm.status && (
              <Button
                onClick={() => handleVerifyDocument(selectedDocument.id, documentForm.status === 'verified' ? 'approve' : 'reject')}
                disabled={isLoading || (documentForm.status === 'rejected' && !documentForm.rejectionReason.trim())}
                className={documentForm.status === 'verified' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isLoading ? 'Processing...' : documentForm.status === 'verified' ? 'Approve Document' : 'Reject Document'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}