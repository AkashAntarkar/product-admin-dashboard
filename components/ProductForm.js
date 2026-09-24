"use client";

import { useState } from "react";

const EMPTY = {
  title: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  thumbnail: "",
};

function validate(values) {
  const errors = {};
  if (!values.title.trim() || values.title.trim().length < 3) {
    errors.title = "Title needs at least 3 characters.";
  }
  if (!values.description.trim() || values.description.trim().length < 10) {
    errors.description = "Description needs at least 10 characters.";
  }
  if (!values.category.trim()) {
    errors.category = "Pick a category.";
  }
  const price = Number(values.price);
  if (!values.price || Number.isNaN(price) || price <= 0) {
    errors.price = "Enter a price greater than 0.";
  }
  const stock = Number(values.stock);
  if (values.stock === "" || Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    errors.stock = "Enter stock as a whole number, 0 or more.";
  }
  if (values.thumbnail && !/^https?:\/\/.+/i.test(values.thumbnail.trim())) {
    errors.thumbnail = "Image URL should start with http:// or https://.";
  }
  return errors;
}

export default function ProductForm({ initialValues, categories, onSubmit, submitLabel }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Blocks double-submits from a fast double click / Enter-mash.
    if (isSubmitting) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        price: Number(values.price),
        stock: Number(values.stock),
        thumbnail: values.thumbnail.trim() || undefined,
      });
    } catch (err) {
      setSubmitError(err.message || "Couldn't save this product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Title" error={errors.title}>
        <input
          type="text"
          value={values.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full rounded-md border border-line px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          rows={4}
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full rounded-md border border-line px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" error={errors.category}>
          <select
            value={values.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Price (USD)" error={errors.price}>
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Stock" error={errors.stock}>
          <input
            type="number"
            step="1"
            min="0"
            value={values.stock}
            onChange={(e) => handleChange("stock", e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Image URL (optional)" error={errors.thumbnail}>
          <input
            type="text"
            placeholder="https://..."
            value={values.thumbnail}
            onChange={(e) => handleChange("thumbnail", e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          />
        </Field>
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-rust">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink">{label}</span>
      <span className="mt-1 block">{children}</span>
      {error && <span className="mt-1 block text-xs text-rust">{error}</span>}
    </label>
  );
}
