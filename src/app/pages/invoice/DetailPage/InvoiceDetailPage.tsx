"use server";

import { type RequestInfo } from "@redwoodjs/sdk/worker";
import { Layout } from "@/app/pages/Layout";
import { InvoiceForm } from "./InvoiceForm";
import { db } from "@/db";
import {
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { link } from "@/app/shared/links";

export type InvoiceLabels = {
  invoiceNumber: string;
  invoiceDate: string;
  itemDescription: string;
  itemQuantity: string;
  itemPrice: string;
  total: string;
  subtotal: string;
};

export type InvoiceItem = {
  description: string;
  price: number;
  quantity: number;
};

export type InvoiceTaxes = {
  description: string;
  amount: number;
};

async function getInvoice(id: string, userId: string) {
  if (id === "new") {
    return {
      id: "new",
      title: "INVOICE",
      number: "1",
      items: [
        {
          description: "",
          quantity: 1,
          price: 1,
        },
      ],
      taxes: [],
      labels: {
        invoiceNumber: "",
        invoiceDate: "",
        itemDescription: "",
        itemQuantity: "",
        itemPrice: "",
        total: "",
        subtotal: "",
      },
      date: new Date(),
      status: "draft",
      userId,
      supplierName: "",
      supplierContact: "",
      supplierLogo: null,
      customer: "",
      currency: "$",
      notesA: "",
      notesB: "",
      createdAt: new Date(),
      updatedAt: null,
    };
  }

  return await db.invoice.findFirstOrThrow({
    where: {
      id,
      userId,
    },
  });
}

export async function InvoiceDetailPage({ params, ctx }: RequestInfo) {
  const invoice = await getInvoice(params.id, ctx.user!.id);

  return (
    <Layout ctx={ctx}>
      <BreadcrumbList>
        <BreadcrumbLink href={link("/invoice/list")}>Invoices</BreadcrumbLink>
        <BreadcrumbSeparator />

        <BreadcrumbPage>Edit Invoice</BreadcrumbPage>
      </BreadcrumbList>
      <InvoiceForm invoice={invoice} ctx={ctx} />
    </Layout>
  );
}
