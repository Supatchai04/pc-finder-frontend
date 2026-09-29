import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  MapPin,
  Search,
} from 'lucide-react';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';


const DEFAULT_CENTER = {
  lat: 13.7563,
  lng: 100.5018,
};


const NOMINATIM_SEARCH_URL =
  'https://nominatim.openstreetmap.org/search';


const getNumberOrNull = (value) => {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};


/*
 * Marker แบบ Custom
 * ไม่ใช้ marker-icon.png ของ Leaflet
 * เพื่อป้องกันปัญหารูป Marker แตกบน Vite
 */
const SHOP_MARKER_ICON = L.divIcon({
  className: '',
  iconSize: [36, 46],
  iconAnchor: [18, 44],

  html: `
    <div
      style="
        width: 34px;
        height: 34px;

        position: relative;

        border-radius: 50% 50% 50% 0;

        background: #ef3f37;

        border: 3px solid #ffffff;

        box-shadow:
          0 3px 10px
          rgba(30, 45, 65, 0.35);

        transform: rotate(-45deg);
      "
    >
      <div
        style="
          position: absolute;

          width: 10px;
          height: 10px;

          top: 9px;
          left: 9px;

          border-radius: 50%;

          background: #ffffff;
        "
      ></div>
    </div>
  `,
});


export default function GoogleMapPicker({
  latitude,
  longitude,
  onChange,
}) {
  const mapElementRef =
    useRef(null);

  const mapInstanceRef =
    useRef(null);

  const markerRef =
    useRef(null);

  const onChangeRef =
    useRef(onChange);

  const searchCacheRef =
    useRef(new Map());


  const [mapReady, setMapReady] =
    useState(false);

  const [mapError, setMapError] =
    useState('');


  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    searchResults,
    setSearchResults,
  ] = useState([]);

  const [
    searchLoading,
    setSearchLoading,
  ] = useState(false);

  const [
    searchError,
    setSearchError,
  ] = useState('');


  /*
   * ให้ Event ของ Leaflet
   * ใช้ onChange ตัวล่าสุดเสมอ
   */
  useEffect(() => {
    onChangeRef.current =
      onChange;
  }, [onChange]);


  /*
   * ==========================
   * SET / MOVE MARKER
   * ==========================
   */
  const setMarkerPosition = (
    lat,
    lng,
    {
      moveMap = true,
      zoom = 17,
      notify = true,
    } = {}
  ) => {
    const map =
      mapInstanceRef.current;

    if (!map) {
      return;
    }


    const validLat =
      Number(lat);

    const validLng =
      Number(lng);


    if (
      !Number.isFinite(validLat) ||
      !Number.isFinite(validLng)
    ) {
      return;
    }


    const position = [
      validLat,
      validLng,
    ];


    /*
     * มี Marker แล้ว
     * -> ย้ายตำแหน่ง
     */
    if (markerRef.current) {
      markerRef.current.setLatLng(
        position
      );
    }

    /*
     * ยังไม่มี Marker
     * -> สร้างใหม่
     */
    else {
      const marker =
        L.marker(
          position,
          {
            draggable: true,
            icon: SHOP_MARKER_ICON,
          }
        ).addTo(map);


      /*
       * ลาก Marker แล้ว
       * update lat / lng กลับไป Parent
       */
      marker.on(
        'dragend',
        (event) => {
          const nextPosition =
            event.target.getLatLng();


          onChangeRef.current?.({
            latitude:
              nextPosition.lat,

            longitude:
              nextPosition.lng,
          });
        }
      );


      markerRef.current =
        marker;
    }


    if (moveMap) {
      map.setView(
        position,
        zoom,
        {
          animate: true,
        }
      );
    }


    if (notify) {
      onChangeRef.current?.({
        latitude: validLat,
        longitude: validLng,
      });
    }
  };


  /*
   * ==========================
   * CREATE MAP
   * ==========================
   */
  useEffect(() => {
    if (
      !mapElementRef.current ||
      mapInstanceRef.current
    ) {
      return;
    }


    try {
      setMapError('');


      const currentLat =
        getNumberOrNull(
          latitude
        );

      const currentLng =
        getNumberOrNull(
          longitude
        );


      const hasPosition =
        currentLat !== null &&
        currentLng !== null;


      const center =
        hasPosition
          ? [
              currentLat,
              currentLng,
            ]
          : [
              DEFAULT_CENTER.lat,
              DEFAULT_CENTER.lng,
            ];


      /*
       * สร้าง Leaflet Map
       */
      const map =
        L.map(
          mapElementRef.current,
          {
            zoomControl: true,

            scrollWheelZoom: true,

            doubleClickZoom: true,
          }
        );


      map.setView(
        center,
        hasPosition
          ? 16
          : 11
      );


      /*
       * OpenStreetMap
       */
      L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,

          attribution:
            '&copy; OpenStreetMap contributors',
        }
      ).addTo(map);


      mapInstanceRef.current =
        map;


      /*
       * ถ้า Backend มี lat/lng เดิม
       * ให้แสดง Marker ทันที
       */
      if (hasPosition) {
        setMarkerPosition(
          currentLat,
          currentLng,
          {
            moveMap: false,
            notify: false,
          }
        );
      }


      /*
       * คลิก Map เพื่อปักหมุด
       */
      map.on(
        'click',
        (event) => {
          const {
            lat,
            lng,
          } = event.latlng;


          setMarkerPosition(
            lat,
            lng,
            {
              moveMap: false,
              notify: true,
            }
          );
        }
      );


      /*
       * ป้องกันปัญหา Map
       * คำนวณขนาดไม่ทันตอน render
       */
      window.setTimeout(
        () => {
          map.invalidateSize();
        },
        150
      );


      setMapReady(true);
    } catch (err) {
      setMapError(
        err?.message ||
          'ไม่สามารถเปิดแผนที่ได้'
      );
    }


    return () => {
      if (
        mapInstanceRef.current
      ) {
        mapInstanceRef.current
          .remove();

        mapInstanceRef.current =
          null;
      }


      markerRef.current =
        null;
    };
  }, []);


  /*
   * ==========================
   * SYNC LATITUDE / LONGITUDE
   *
   * ใช้ตอน:
   * - โหลดค่าจาก Backend
   * - Refresh
   * - Reset
   * ==========================
   */
  useEffect(() => {
    const map =
      mapInstanceRef.current;

    if (!map) {
      return;
    }


    const currentLat =
      getNumberOrNull(
        latitude
      );

    const currentLng =
      getNumberOrNull(
        longitude
      );


    /*
     * ไม่มี lat/lng
     * -> ลบ Marker
     */
    if (
      currentLat === null ||
      currentLng === null
    ) {
      if (
        markerRef.current
      ) {
        map.removeLayer(
          markerRef.current
        );

        markerRef.current =
          null;
      }

      return;
    }


    /*
     * มี lat/lng
     * -> แสดง Marker
     */
    setMarkerPosition(
      currentLat,
      currentLng,
      {
        moveMap: true,
        zoom: 16,
        notify: false,
      }
    );
  }, [
    latitude,
    longitude,
  ]);


  /*
   * ==========================
   * SEARCH WITH NOMINATIM
   * ==========================
   */
  const searchPlace = async () => {
    const query =
      searchText.trim();


    if (!query) {
      setSearchError(
        'กรุณาพิมพ์ชื่อสถานที่ที่ต้องการค้นหา'
      );

      setSearchResults([]);

      return;
    }


    /*
     * Cache ป้องกันค้นคำเดิมซ้ำ
     */
    const cacheKey =
      query.toLowerCase();


    if (
      searchCacheRef.current.has(
        cacheKey
      )
    ) {
      const cachedResults =
        searchCacheRef.current.get(
          cacheKey
        );


      setSearchResults(
        cachedResults
      );

      setSearchError('');

      return;
    }


    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);


    try {
      const params =
        new URLSearchParams({
          q: query,

          format: 'jsonv2',

          limit: '5',

          countrycodes: 'th',

          'accept-language':
            'th',
        });


      const response =
        await fetch(
          `${NOMINATIM_SEARCH_URL}?${params.toString()}`,
          {
            method: 'GET',

            headers: {
              Accept:
                'application/json',
            },
          }
        );


      if (!response.ok) {
        throw new Error(
          `ค้นหาสถานที่ไม่สำเร็จ (${response.status})`
        );
      }


      const data =
        await response.json();


      const results =
        Array.isArray(data)
          ? data
              .map(
                (item) => ({
                  placeId:
                    item.place_id,

                  displayName:
                    item.display_name,

                  latitude:
                    Number(
                      item.lat
                    ),

                  longitude:
                    Number(
                      item.lon
                    ),

                  type:
                    item.type ||
                    '',
                })
              )
              .filter(
                (item) =>
                  Number.isFinite(
                    item.latitude
                  ) &&
                  Number.isFinite(
                    item.longitude
                  )
              )
          : [];


      searchCacheRef.current.set(
        cacheKey,
        results
      );


      setSearchResults(
        results
      );


      if (!results.length) {
        setSearchError(
          'ไม่พบสถานที่ที่ตรงกับคำค้นหา'
        );
      }
    } catch (err) {
      setSearchError(
        err?.message ||
          'ค้นหาสถานที่ไม่สำเร็จ'
      );
    } finally {
      setSearchLoading(false);
    }
  };


  /*
   * ==========================
   * USER SELECT SEARCH RESULT
   * ==========================
   */
  const chooseSearchResult = (
    result
  ) => {
    setMarkerPosition(
      result.latitude,
      result.longitude,
      {
        moveMap: true,
        zoom: 17,
        notify: true,
      }
    );


    setSearchText(
      result.displayName
    );


    setSearchResults([]);

    setSearchError('');
  };


  const hasPosition =
    getNumberOrNull(
      latitude
    ) !== null &&
    getNumberOrNull(
      longitude
    ) !== null;


  return (
    <div className="map-picker-shell">

      {/* =======================
          SEARCH
          ======================= */}

      <div className="map-search-section">

        <div className="map-search-label">

          <strong>
            ค้นหาสถานที่
          </strong>

          <span>
            ค้นหาชื่อสถานที่ ถนน เขต
            อำเภอ หรือจังหวัด
          </span>

        </div>


        <div className="map-search-control">

          <Search size={18} />


          <input
            type="text"
            value={searchText}
            placeholder="เช่น มจธ. บางมด, สยาม, บางเขน กรุงเทพ"
            onChange={(event) => {
              setSearchText(
                event.target.value
              );

              setSearchError('');
            }}
            onKeyDown={(event) => {
              if (
                event.key ===
                'Enter'
              ) {
                event.preventDefault();

                if (
                  !searchLoading
                ) {
                  searchPlace();
                }
              }
            }}
          />


          <button
            type="button"
            onClick={
              searchPlace
            }
            disabled={
              searchLoading
            }
          >
            {searchLoading
              ? 'กำลังค้นหา...'
              : 'ค้นหา'}
          </button>

        </div>


        {searchError && (
          <div className="map-search-error">
            {searchError}
          </div>
        )}


        {!!searchResults.length && (
          <div className="map-search-results">

            {searchResults.map(
              (result) => (
                <button
                  key={
                    result.placeId
                  }
                  type="button"
                  onClick={() =>
                    chooseSearchResult(
                      result
                    )
                  }
                >

                  <MapPin
                    size={17}
                  />


                  <span>
                    {
                      result.displayName
                    }
                  </span>

                </button>
              )
            )}

          </div>
        )}

      </div>


      {/* =======================
          POSITION STATUS
          ======================= */}

      <div className="map-picker-info">

        <MapPin size={18} />


        <div>

          <strong>
            {hasPosition
              ? 'ปักหมุดตำแหน่งร้านแล้ว'
              : 'ยังไม่ได้ปักหมุดตำแหน่งร้าน'}
          </strong>


          <span>
            ค้นหาสถานที่ คลิกบนแผนที่
            หรือลากหมุดเพื่อเปลี่ยนตำแหน่งร้านค้า
          </span>

        </div>

      </div>


      {/* =======================
          MAP
          ======================= */}

      <div className="map-picker-container">

        <div
          ref={mapElementRef}
          className="map-picker-canvas"
        />


        {!mapReady &&
          !mapError && (
            <div className="map-picker-state">
              กำลังโหลดแผนที่...
            </div>
          )}


        {mapError && (
          <div className="map-picker-state error">

            <strong>
              ไม่สามารถเปิดแผนที่ได้
            </strong>

            <span>
              {mapError}
            </span>

          </div>
        )}

      </div>


      {/* =======================
          HINT
          ======================= */}

      <div className="map-picker-hint">

        <MapPin size={15} />


        <span>
          ระบบจะส่ง Latitude และ
          Longitude จากหมุดนี้ไปยัง
          Backend อัตโนมัติเมื่อกดบันทึก
        </span>

      </div>

    </div>
  );
}