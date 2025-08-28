"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinanceOverview from "@/components/admin/FinanceOverview";
import TransactionManagement from "@/components/admin/TransactionManagement";
import CostManagement from "@/components/admin/CostManagement";
import PartnerManagement from "@/components/admin/PartnerManagement";




export default function AdminFinancePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">Track profits, costs, and partner investments</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <FinanceOverview />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionManagement />
        </TabsContent>

        <TabsContent value="costs">
          <CostManagement />
        </TabsContent>

        <TabsContent value="partners">
          <PartnerManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}