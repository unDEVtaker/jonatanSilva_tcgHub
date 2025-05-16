// <!-- <h3 class="mt-4 mb-3">Dirección</h3>
//               <div class="mb-3">
//                 <label for="provincia" class="form-label">Provincia</label>
//                 <select name="provincia" id="provincia" class="form-select">
//                   <% provincias.forEach(provincia=> { %>
//                     <option value="<%= provincia.id %>" <%=locals.user && locals.user.province &&
//                       locals.user.province==provincia.id ? "selected" : "" %>><%= provincia.nombre%>
//                     </option>
//                     <% }); %>
//                 </select>
//                 <% if(locals.errores && locals.errores.provincia) {%>
//                   <div class="text-danger">
//                     <%= errores.provincia.msg %>
//                   </div>
//                   <% } %>
//               </div>
//               <div class="mb-3">
//                 <label for="localidad" class="form-label">localidad</label>
//                 <select name="localidad" id="localidad" class="form-select">
//                   <% localidades.forEach(localidad=> { %>
//                     <option value="<%= localidad.id %>" <%=locals.user && locals.user.city &&
//                       locals.user.city==localidad.id ? "selected" : "" %>><%= localidad.nombre%>
//                     </option>
//                     <% }); %>
//                 </select>
//                 <% if(locals.errores && locals.errores.localidad) {%>
//                   <div class="text-danger">
//                     <%= errores.localidad.msg %>
//                   </div>
//                   <% } %>
//               </div>
//               <div class="mb-3">
//                 <label for="calle" class="form-label">Calle</label>
//                 <input type="text" name="calle" id="calle" class="form-control"
//                   value="<%= locals.user && locals.user.street ? user.street : ""%>">
//                 <% if(locals.errores && locals.errores.calle) {%>
//                   <div class="text-danger">
//                     <%= errores.calle.msg %>
//                   </div>
//                   <% } %>
//               </div>
//               <div class="mb-3">
//                 <label for="altura" class="form-label">Altura</label>
//                 <input type="text" name="altura" id="altura" class="form-control"
//                   value="<%= locals.user && locals.user.number ? user.number : ""%>">
//                 <% if(locals.errores && locals.errores.altura) {%>
//                   <div class="text-danger">
//                     <%= errores.altura.msg %>
//                   </div>
//                   <% } %>
//               </div>
//               <div class="mb-3">
//                 <label for="telefono" class="form-label">telefono</label>
//                 <input type="number" name="telefono" id="telefono" class="form-control"
//                   value="<%= locals.user && locals.user.phone_number ? user.phone_number : ""%>">
//                 <% if(locals.errores && locals.errores.telefono) {%>
//                   <div class="text-danger">
//                     <%= errores.telefono.msg %>
//                   </div>
//                   <% } %>
//               </div> -->