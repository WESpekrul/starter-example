
'use server';


import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
 
const FormSchema = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  email: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  image_url: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
});

const CreateCustomer = FormSchema.omit({ id: true});

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    image_url?: string[];
  };
  message?: string | null;
};
 
export async function createCustomer(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create CUSTOMERS.',
    };
  }
 
  // Prepare data for insertion into the database
  const { name, email, image_url } = validatedFields.data; 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${image_url})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

// Use Zod to update the expected types
const UpdateCustomer = FormSchema.omit({ id: true, date: true });
 
// ... 
export async function updateCustomers(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateCustomer.safeParse({
    customerId: formData.get('custoerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
    };
  }
 
  const { name, email, image_url  } = validatedFields.data;
  
  try {
    await sql`
      UPDATE customers
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Customer.' };
  }
 
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function deleteCustomers(id: string) {
  throw new Error('Failed to Delete Customers');
  try {
    await sql`DELETE FROM Customers WHERE id = ${id}`;
    revalidatePath('/dashboard/Customers');
    return { message: 'Deleted Customers.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Customers.' };
  }
}