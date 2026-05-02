// @/components/recipe/RecipeFormFields.tsx
import FormInput from '@/app/components/form/FormInput'
import ImageUpload from '@/app/components/ui/ImageUpload'
import { Users, Clock } from 'lucide-react';

import { useTranslation } from '@/app/components/context/LanguageProvider';

interface RecipeFormFieldsProps {
 formData: any;
 handleChange: (e: any) => void;
 onImageChange: (url: string) => void;
}

export default function FormRecipeFields({ formData, handleChange, onImageChange }: RecipeFormFieldsProps) {

 const t = useTranslation();

 return (
 <>
 <ImageUpload
 label={t.form.imageRecipe}
 value={formData.image_url || ''}
 onChange={onImageChange}
 folder="recipes"
 aspectRatio="16/9"
 />

 <div>
 <FormInput
 id="title"
 name="title"
 type="text"
 required
 placeholder={t.recipes.placeholder.name}
 value={formData.title}
 onChange={handleChange}
 label={t.form.name}
 />
 </div>
 <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

 {/* Tags */}
 <div>
 <FormInput
 id="tags"
 name="tags"
 type="text"
 placeholder={t.recipes.placeholder.tags}
 value={formData.tags}
 onChange={handleChange}
 label={t.form.tags}
 />
 </div>

 {/* Privacidad */}
 <div>
 <FormInput
 label="Privacidad"
 id="permission"
 name="permission"
 type="select"
 value={formData.permission}
 onChange={handleChange}
 options={[
 { value: "0", label: t.form.privacity.public },
 { value: "1", label: t.form.privacity.friends },
 { value: "2", label: t.form.privacity.private }
 ]}
 />


 </div>
 </section>

 <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* servings */}
 <div>
 <FormInput
 label={t.form.servings}
 id="servings"
 name="servings"
 type="number"
 placeholder="Ej: 1, 2, 3..."
 onChange={handleChange}
 value={formData.servings}
 icon={Users}
 />
 </div>
 {/* duration */}
 <div>
 <FormInput
 label={t.form.duration}
 id="duration"
 name="duration"
 type="text"
 placeholder={t.placeholder.duration}
 onChange={handleChange}
 value={formData.duration}
 icon={Clock}
 />
 </div>
 </section>

 {/* Descriptions */}
 <div className="md:col-span-2">
 <FormInput
 label={t.form.descriptionShort}
 id="description"
 name="description"
 type="text"
 placeholder={t.placeholder.descriptionShort}
 value={formData.description}
 onChange={handleChange}
 />
 </div>

 <div className="md:col-span-2">
 <FormInput
 label={t.form.descriptionLong}
 id="long_description"
 name="long_description"
 type="textarea"
 placeholder={t.placeholder.descriptionLong}
 rows={4}
 value={formData.long_description}
 onChange={handleChange}
 />
 </div>


 {/* Ingredientes */}
 <div>
 <FormInput
 label={t.form.ingredients}
 id="ingredients"
 name="ingredients"
 type="textarea"
 required
 placeholder={t.recipes.placeholder.ingredients}
 rows={6}
 value={formData.ingredients}
 onChange={handleChange}
 />
 </div>

 {/* Instrucciones */}
 <div>
 <FormInput
 label={t.form.instructions}
 id="instructions"
 name="instructions"
 type="textarea"
 required
 placeholder={t.recipes.placeholder.instructions}
 rows={6}
 value={formData.instructions}
 onChange={handleChange}
 />
 </div>
 </>
 );
}