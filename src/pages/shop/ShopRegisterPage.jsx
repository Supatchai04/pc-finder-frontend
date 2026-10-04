import {

  useState,

} from 'react';



import {

  useNavigate,

} from 'react-router-dom';



import {

  MapPin,

} from 'lucide-react';



import PageHeader from '../../components/ui/PageHeader';

import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';

import GoogleMapPicker from '../../components/maps/GoogleMapPicker';



import { shopService } from '../../services/shopService';
import { dropdownService } from '../../services/dropdownService';

import { getApiErrorMessage } from '../../utils/api';





const MAX_FILE_SIZE =

  20 * 1024 * 1024;





const hasCoordinate = (value) => {

  if (

    value === '' ||

    value === null ||

    value === undefined

  ) {

    return false;

  }



  return Number.isFinite(

    Number(value)

  );

};





export default function ShopRegisterPage() {

  const navigate =

    useNavigate();





  const [error, setError] =

    useState('');



  const [saving, setSaving] =

    useState(false);



  const [

    fieldErrors,

    setFieldErrors,

  ] = useState({});





  /*

   * พิกัดจาก OpenStreetMap

   * User ไม่ต้องกรอก Latitude / Longitude เอง

   */

  const [

    location,

    setLocation,

  ] = useState({

    latitude: '',

    longitude: '',

  });


  /*
   * Cascading Thai address
   * จังหวัด -> เขต/อำเภอ -> แขวง/ตำบล -> รหัสไปรษณีย์
   */
  const [

    addressSelection,

    setAddressSelection,

  ] = useState({

    province: '',

    district: '',

    subDistrict: '',

    zipCode: '',

  });


  const provinceOptions =

    dropdownService.provinces();


  const districtOptions =

    dropdownService.districts(

      addressSelection.province

    );


  const subDistrictOptions =

    dropdownService.subDistricts(

      addressSelection.province,

      addressSelection.district

    );





  /*

   * ลบ Error เมื่อเริ่มแก้ไขช่องนั้น

   */

  const clearFieldError = (

    fieldName

  ) => {

    setFieldErrors(

      (previous) => {

        if (

          !previous[fieldName]

        ) {

          return previous;

        }



        const next = {

          ...previous,

        };



        delete next[fieldName];



        return next;

      }

    );

  };





  const clearAddressErrors = (

    ...fieldNames

  ) => {

    fieldNames.forEach(

      (fieldName) =>

        clearFieldError(

          fieldName

        )

    );

  };


  const handleProvinceChange = (

    event

  ) => {

    const province =

      event.target.value;


    setAddressSelection({

      province,

      district: '',

      subDistrict: '',

      zipCode: '',

    });


    clearAddressErrors(

      'province',

      'district',

      'subDistrict',

      'zipCode'

    );

  };


  const handleDistrictChange = (

    event

  ) => {

    const district =

      event.target.value;


    setAddressSelection(

      (previous) => ({

        ...previous,

        district,

        subDistrict: '',

        zipCode: '',

      })

    );


    clearAddressErrors(

      'district',

      'subDistrict',

      'zipCode'

    );

  };


  const handleSubDistrictChange = (

    event

  ) => {

    const subDistrict =

      event.target.value;


    const zipCode =

      dropdownService.zipCode(

        addressSelection.province,

        addressSelection.district,

        subDistrict

      );


    setAddressSelection(

      (previous) => ({

        ...previous,

        subDistrict,

        zipCode,

      })

    );


    clearAddressErrors(

      'subDistrict',

      'zipCode'

    );

  };



  /*

   * รับตำแหน่งจาก Map

   */

  const handleLocationChange = ({

    latitude,

    longitude,

  }) => {

    setLocation({

      latitude,

      longitude,

    });



    clearFieldError(

      'location'

    );



    setError('');

  };





  /*

   * ==========================

   * VALIDATION

   * ==========================

   */

  const validateForm = (

    form

  ) => {

    const errors = {};





    /*

     * ช่องข้อความที่บังคับ

     */

    const requiredFields = [

      'ownerFirstName',

      'ownerLastName',

      'shopName',

      'ownerPhone',



      'addressText',

      'province',

      'district',

      'subDistrict',

      'zipCode',



      'operatingHours',

    ];





    requiredFields.forEach(

      (name) => {

        const value =

          form[name]

            ?.value

            ?.trim();



        if (!value) {

          errors[name] =

            'กรุณากรอกให้ครบ';

        }

      }

    );





    /*

     * รูปโปรไฟล์ร้านค้า

     */

    if (

      !form.profileImageUrl

        ?.files?.[0]

    ) {

      errors.profileImageUrl =

        'กรุณาเลือกรูปโปรไฟล์ร้านค้า';

    }





    /*

     * รูปบัตรประชาชน

     */

    if (

      !form.idCardImage

        ?.files?.[0]

    ) {

      errors.idCardImage =

        'กรุณาเลือกรูปบัตรประชาชน';

    }





    /*

     * รูปหน้าร้าน

     */

    if (

      !form.storeImage

        ?.files?.[0]

    ) {

      errors.storeImage =

        'กรุณาเลือกรูปหน้าร้าน';

    }





    /*

     * ต้องปักหมุดตำแหน่งร้าน

     */

    if (

      !hasCoordinate(

        location.latitude

      ) ||

      !hasCoordinate(

        location.longitude

      )

    ) {

      errors.location =

        'กรุณาปักหมุดตำแหน่งร้านค้า';

    }





    setFieldErrors(

      errors

    );





    return (

      Object.keys(errors)

        .length === 0

    );

  };





  /*

   * ==========================

   * SUBMIT

   * ==========================

   */

  const submit = async (

    event

  ) => {

    event.preventDefault();



    setError('');





    const form =

      event.currentTarget;





    /*

     * ตรวจข้อมูลทั้งหมดก่อน

     */

    const valid =

      validateForm(form);





    if (!valid) {

      setError(

        'กรุณาตรวจสอบข้อมูลที่มีข้อความสีแดงและกรอกข้อมูลให้ครบถ้วน'

      );





      window.scrollTo({

        top: 0,

        behavior: 'smooth',

      });



      return;

    }





    const latitude =

      Number(

        location.latitude

      );



    const longitude =

      Number(

        location.longitude

      );





    /*

     * ชื่อ Field ต้องตรงกับ multer ฝั่ง Backend

     */

    const fileKeys = [

      'profileImageUrl',

      'idCardImage',

      'businessRegImage',

      'storeImage',

    ];





    /*

     * Backend จำกัดไฟล์ไม่เกิน 20 MB ต่อไฟล์

     */

    for (

      const key of fileKeys

    ) {

      const file =

        form[key]

          ?.files?.[0];





      if (

        file &&

        file.size >

          MAX_FILE_SIZE

      ) {

        setFieldErrors(

          (previous) => ({

            ...previous,



            [key]:

              'ไฟล์ต้องมีขนาดไม่เกิน 20 MB',

          })

        );





        setError(

          `ไฟล์ ${file.name} มีขนาดเกิน 20 MB`

        );





        window.scrollTo({

          top: 0,

          behavior: 'smooth',

        });



        return;

      }

    }





    setSaving(true);





    try {

      const formData =

        new FormData();





      /*

       * ==========================

       * OWNER / SHOP

       * ==========================

       */



      formData.append(

        'ownerFirstName',

        form.ownerFirstName

          .value.trim()

      );





      formData.append(

        'ownerLastName',

        form.ownerLastName

          .value.trim()

      );





      formData.append(

        'shopName',

        form.shopName

          .value.trim()

      );





      formData.append(

        'ownerPhone',

        form.ownerPhone

          .value.trim()

      );





      /*

       * ==========================

       * CONTACT

       * ==========================

       */



      formData.append(

        'contactChannels',

        JSON.stringify({

          line:

            form.line

              .value.trim(),



          facebook:

            form.facebook

              .value.trim(),



          website:

            form.website

              .value.trim(),

        })

      );





      /*

       * ==========================

       * ADDRESS

       * ==========================

       */



      formData.append(

        'addressText',

        form.addressText

          .value.trim()

      );





      formData.append(

        'province',

        form.province

          .value.trim()

      );





      formData.append(

        'district',

        form.district

          .value.trim()

      );





      formData.append(

        'subDistrict',

        form.subDistrict

          .value.trim()

      );





      formData.append(

        'zipCode',

        form.zipCode

          .value.trim()

      );





      /*

       * ==========================

       * LOCATION FROM MAP

       * ==========================

       */



      formData.append(

        'latitude',

        String(latitude)

      );





      formData.append(

        'longitude',

        String(longitude)

      );





      /*

       * ==========================

       * OPERATING HOURS

       * ==========================

       */



      formData.append(

        'operatingHours',

        form.operatingHours

          .value.trim()

      );





      /*

       * ==========================

       * FILES

       *

       * profileImageUrl

       * idCardImage

       * businessRegImage

       * storeImage

       * ==========================

       */



      fileKeys.forEach(

        (key) => {

          const file =

            form[key]

              ?.files?.[0];



          if (file) {

            formData.append(

              key,

              file

            );

          }

        }

      );





      /*

       * ส่งคำขอสมัครร้าน

       */

      await shopService.register(

        formData

      );





      /*

       * สมัครสำเร็จ

       */

      window.alert(

        'ลงทะเบียนร้านค้าเรียบร้อยแล้ว'

      );





      /*

       * กด OK แล้วกลับ Home

       */

      navigate(

        '/',

        {

          replace: true,

        }

      );



    } catch (err) {

      setError(

        getApiErrorMessage(

          err,

          'ส่งคำขอเปิดร้านไม่สำเร็จ'

        )

      );





      window.scrollTo({

        top: 0,

        behavior: 'smooth',

      });



    } finally {

      setSaving(false);

    }

  };





  const hasLocation =

    hasCoordinate(

      location.latitude

    ) &&

    hasCoordinate(

      location.longitude

    );





  return (

    <CustomerPageFrame>



      <div className="content-page public-content-page">



        <PageHeader

          title="กรอกฟอร์มร้านค้า"

          subtitle="กรอกข้อมูลให้ครบถ้วนเพื่อส่งคำขอเปิดร้านในระบบ PC FINDER"

        />





        {error && (

          <div className="inline-error">

            {error}

          </div>

        )}





        <form

          className="register-form"

          onSubmit={submit}

          encType="multipart/form-data"

          noValidate

        >



          {/* =========================

              OWNER / SHOP

              ========================= */}



          <section>



            <h3>

              ข้อมูลเจ้าของร้านและร้านค้า

            </h3>





            <div className="form-grid-2">



              <label>



                <span>

                  ชื่อเจ้าของร้าน

                  <b> *</b>

                </span>





                <input

                  name="ownerFirstName"

                  className={

                    fieldErrors.ownerFirstName

                      ? 'input-error'

                      : ''

                  }

                  onChange={() =>

                    clearFieldError(

                      'ownerFirstName'

                    )

                  }

                />





                {fieldErrors.ownerFirstName && (

                  <small className="field-error-message">

                    * {fieldErrors.ownerFirstName}

                  </small>

                )}



              </label>





              <label>



                <span>

                  นามสกุล

                  <b> *</b>

                </span>





                <input

                  name="ownerLastName"

                  className={

                    fieldErrors.ownerLastName

                      ? 'input-error'

                      : ''

                  }

                  onChange={() =>

                    clearFieldError(

                      'ownerLastName'

                    )

                  }

                />





                {fieldErrors.ownerLastName && (

                  <small className="field-error-message">

                    * {fieldErrors.ownerLastName}

                  </small>

                )}



              </label>





              <label>



                <span>

                  ชื่อร้านค้า

                  <b> *</b>

                </span>





                <input

                  name="shopName"

                  className={

                    fieldErrors.shopName

                      ? 'input-error'

                      : ''

                  }

                  onChange={() =>

                    clearFieldError(

                      'shopName'

                    )

                  }

                />





                {fieldErrors.shopName && (

                  <small className="field-error-message">

                    * {fieldErrors.shopName}

                  </small>

                )}



              </label>





              <label>



                <span>

                  เบอร์โทรศัพท์

                  <b> *</b>

                </span>





                <input

                  name="ownerPhone"

                  className={

                    fieldErrors.ownerPhone

                      ? 'input-error'

                      : ''

                  }

                  onChange={() =>

                    clearFieldError(

                      'ownerPhone'

                    )

                  }

                />





                {fieldErrors.ownerPhone && (

                  <small className="field-error-message">

                    * {fieldErrors.ownerPhone}

                  </small>

                )}



              </label>



            </div>



          </section>





          {/* =========================

              CONTACT

              ========================= */}



          <section>



            <h3>

              ช่องทางการติดต่อ

            </h3>





            <div className="form-grid-3">



              <label>

                Line ID



                <input

                  name="line"

                />

              </label>





              <label>

                Facebook



                <input

                  name="facebook"

                />

              </label>





              <label>

                เว็บไซต์



                <input

                  name="website"

                />

              </label>



            </div>



          </section>





          {/* =========================

              ADDRESS

              ========================= */}



          <section>



            <h3>

              ที่อยู่ร้านค้า

            </h3>





            <label>



              <span>

                บ้านเลขที่ / อาคาร / ซอย / ถนน

                <b> *</b>

              </span>





              <textarea

                name="addressText"

                rows="3"

                className={

                  fieldErrors.addressText

                    ? 'input-error'

                    : ''

                }

                onChange={() =>

                  clearFieldError(

                    'addressText'

                  )

                }

              />





              {fieldErrors.addressText && (

                <small className="field-error-message">

                  * {fieldErrors.addressText}

                </small>

              )}



            </label>





            <div className="form-grid-4">

              <label>

                <span>
                  จังหวัด
                  <b> *</b>
                </span>

                <select
                  name="province"
                  value={addressSelection.province}
                  className={
                    fieldErrors.province
                      ? 'input-error'
                      : ''
                  }
                  onChange={handleProvinceChange}
                >
                  <option value="">
                    เลือกจังหวัด
                  </option>

                  {provinceOptions.map(
                    (province) => (
                      <option
                        key={province}
                        value={province}
                      >
                        {province}
                      </option>
                    )
                  )}
                </select>

                {fieldErrors.province && (
                  <small className="field-error-message">
                    * {fieldErrors.province}
                  </small>
                )}

              </label>


              <label>

                <span>
                  เขต / อำเภอ
                  <b> *</b>
                </span>

                <select
                  name="district"
                  value={addressSelection.district}
                  disabled={!addressSelection.province}
                  className={
                    fieldErrors.district
                      ? 'input-error'
                      : ''
                  }
                  onChange={handleDistrictChange}
                >
                  <option value="">
                    {addressSelection.province
                      ? 'เลือกเขต / อำเภอ'
                      : 'กรุณาเลือกจังหวัดก่อน'}
                  </option>

                  {districtOptions.map(
                    (district) => (
                      <option
                        key={district}
                        value={district}
                      >
                        {district}
                      </option>
                    )
                  )}
                </select>

                {fieldErrors.district && (
                  <small className="field-error-message">
                    * {fieldErrors.district}
                  </small>
                )}

              </label>


              <label>

                <span>
                  แขวง / ตำบล
                  <b> *</b>
                </span>

                <select
                  name="subDistrict"
                  value={addressSelection.subDistrict}
                  disabled={!addressSelection.district}
                  className={
                    fieldErrors.subDistrict
                      ? 'input-error'
                      : ''
                  }
                  onChange={handleSubDistrictChange}
                >
                  <option value="">
                    {addressSelection.district
                      ? 'เลือกแขวง / ตำบล'
                      : 'กรุณาเลือกเขต / อำเภอก่อน'}
                  </option>

                  {subDistrictOptions.map(
                    (subDistrict) => (
                      <option
                        key={subDistrict}
                        value={subDistrict}
                      >
                        {subDistrict}
                      </option>
                    )
                  )}
                </select>

                {fieldErrors.subDistrict && (
                  <small className="field-error-message">
                    * {fieldErrors.subDistrict}
                  </small>
                )}

              </label>


              <label>

                <span>
                  รหัสไปรษณีย์
                  <b> *</b>
                </span>

                <input
                  name="zipCode"
                  value={addressSelection.zipCode}
                  readOnly
                  placeholder="เลือกแขวง / ตำบลก่อน"
                  className={
                    fieldErrors.zipCode
                      ? 'input-error'
                      : ''
                  }
                />

                {fieldErrors.zipCode && (
                  <small className="field-error-message">
                    * {fieldErrors.zipCode}
                  </small>
                )}

              </label>

            </div>



          </section>





          {/* =========================

              MAP

              ========================= */}



          <section className="shop-register-location-section">



            <div className="shop-register-location-heading">



              <div className="shop-register-location-icon">

                <MapPin size={20} />

              </div>





              <div>



                <h3>

                  ปักหมุดตำแหน่งร้านค้า *

                </h3>



                <p>

                  ค้นหาสถานที่ คลิกบนแผนที่

                  หรือลากหมุดไปยังตำแหน่งร้านจริง

                </p>



              </div>



            </div>





            <div

              className={

                fieldErrors.location

                  ? 'shop-register-map-error'

                  : ''

              }

            >



              <GoogleMapPicker

                latitude={

                  location.latitude

                }

                longitude={

                  location.longitude

                }

                onChange={

                  handleLocationChange

                }

              />



            </div>





            {fieldErrors.location && (

              <small className="field-error-message map-field-error">

                * {fieldErrors.location}

              </small>

            )}





            <div

              className={

                hasLocation

                  ? 'shop-register-location-status ready'

                  : 'shop-register-location-status'

              }

            >



              <MapPin size={15} />





              <span>

                {hasLocation

                  ? 'เลือกตำแหน่งร้านค้าเรียบร้อยแล้ว'

                  : 'กรุณาปักหมุดตำแหน่งร้านค้าก่อนส่งคำขอ'}

              </span>



            </div>



          </section>





          {/* =========================

              OPERATING HOURS

              ========================= */}



          <section>



            <h3>

              เวลาทำการ

            </h3>





            <label>



              <span>

                รายละเอียดเวลาทำการ

                <b> *</b>

              </span>





              <input

                name="operatingHours"

                placeholder="เช่น จันทร์-เสาร์ 09:00 - 18:00"

                className={

                  fieldErrors.operatingHours

                    ? 'input-error'

                    : ''

                }

                onChange={() =>

                  clearFieldError(

                    'operatingHours'

                  )

                }

              />





              {fieldErrors.operatingHours && (

                <small className="field-error-message">

                  * {fieldErrors.operatingHours}

                </small>

              )}



            </label>



          </section>





          {/* =========================

              PROFILE IMAGE

              ========================= */}



          <section>



            <h3>

              รูปโปรไฟล์ร้านค้า

            </h3>





            <label>



              <span>

                รูปโปรไฟล์ร้านค้า

                <b> *</b>

              </span>





              <input

                name="profileImageUrl"

                type="file"

                accept="image/*"

                className={

                  fieldErrors.profileImageUrl

                    ? 'input-error'

                    : ''

                }

                onChange={() =>

                  clearFieldError(

                    'profileImageUrl'

                  )

                }

              />





              {fieldErrors.profileImageUrl ? (

                <small className="field-error-message">

                  * {fieldErrors.profileImageUrl}

                </small>

              ) : (

                <small>

                  รองรับไฟล์รูปภาพ ขนาดไม่เกิน 20 MB

                </small>

              )}



            </label>



          </section>





          {/* =========================

              DOCUMENTS

              ========================= */}



          <section>



            <h3>

              เอกสารยืนยัน

            </h3>





            <div className="form-grid-3">



              <label>



                <span>

                  รูปบัตรประชาชน

                  <b> *</b>

                </span>





                <input

                  name="idCardImage"

                  type="file"

                  accept="image/*"

                  className={

                    fieldErrors.idCardImage

                      ? 'input-error'

                      : ''

                  }

                  onChange={() =>

                    clearFieldError(

                      'idCardImage'

                    )

                  }

                />





                {fieldErrors.idCardImage ? (

                  <small className="field-error-message">

                    * {fieldErrors.idCardImage}

                  </small>

                ) : (

                  <small>

                    ไฟล์ไม่เกิน 20 MB

                  </small>

                )}



              </label>





              <label>



                หนังสือรับรองบริษัท (ถ้ามี)





                <input

                  name="businessRegImage"

                  type="file"

                  accept="image/*,.pdf"

                  className={

                    fieldErrors.businessRegImage

                      ? 'input-error'

                      : ''

                  }

                  onChange={() =>

                    clearFieldError(

                      'businessRegImage'

                    )

                  }

                />





                {fieldErrors.businessRegImage ? (

                  <small className="field-error-message">

                    * {fieldErrors.businessRegImage}

                  </small>

                ) : (

                  <small>

                    ไฟล์ไม่เกิน 20 MB

                  </small>

                )}



              </label>





              <label>



                <span>

                  รูปหน้าร้าน

                  <b> *</b>

                </span>





                <input

                  name="storeImage"

                  type="file"

                  accept="image/*"

                  className={

                    fieldErrors.storeImage

                      ? 'input-error'

                      : ''

                  }

                  onChange={() =>

                    clearFieldError(

                      'storeImage'

                    )

                  }

                />





                {fieldErrors.storeImage ? (

                  <small className="field-error-message">

                    * {fieldErrors.storeImage}

                  </small>

                ) : (

                  <small>

                    ไฟล์ไม่เกิน 20 MB

                  </small>

                )}



              </label>



            </div>



          </section>





          {/* =========================

              SUBMIT

              ========================= */}



          <button

            className="primary-btn wide"

            type="submit"

            disabled={saving}

          >

            {saving

              ? 'กำลังส่งข้อมูล...'

              : 'ส่งคำขอเปิดร้าน'}

          </button>



        </form>



      </div>



    </CustomerPageFrame>

  );

}